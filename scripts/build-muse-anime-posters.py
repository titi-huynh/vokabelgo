"""Extract chapter covers from reviewed dialogue, without changing any episode.

The first chapter's cover is also the catalog cover. Reviewed shortlist cues are
preferred over chapter start times so openings, black leaders and music are not
chosen by accident. Small grayscale probes reject black frames and white flashes.
"""
import argparse
import json
import math
from pathlib import Path
import statistics
import subprocess

ROOT = Path(__file__).resolve().parents[1]
KEYS = ('k_on_s01e01', 'delicious_in_dungeon_s01e01', 'frieren_s01e02', 'sakura_s01e02')
DEFAULT_DIRS = {
    'k_on_s01e01': ROOT / 'qa/kino-alignment/muse-two-films',
    'delicious_in_dungeon_s01e01': ROOT / 'qa/kino-alignment/muse-two-films',
    'frieren_s01e02': ROOT / 'qa/kino-alignment/season1-episode2',
    'sakura_s01e02': ROOT / 'qa/kino-alignment/season1-episode2',
}
FILTER = ('scale=960:540:force_original_aspect_ratio=decrease:force_divisible_by=2,'
          'pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x19131c,setsar=1')


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def run(args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf8', errors='replace').strip()[-1500:])
    return result.stdout


def needs_review(cue, uncertain):
    return cue.get('reviewNeeded') or cue.get('practiceExcluded') or any(
        item.get('id') == cue['id'] or item.get('cueId') == cue['id'] or
        (number(item.get('start')) and number(item.get('end')) and
         item['start'] < cue['end'] and item['end'] > cue['start'])
        for item in uncertain)


def prepare(key, input_dir):
    source = ROOT / 'video' / f'{key}-web-v1.mp4'
    ensure(source.is_file(), f'{key}: missing playback MP4 {source}')
    json_path = (input_dir / f'{key}.json') if input_dir and (input_dir / f'{key}.json').is_file() else (DEFAULT_DIRS[key] / f'{key}.json')
    data = json.loads(json_path.read_text(encoding='utf-8-sig'))
    ensure(data.get('videoKey') == key, f'{key}: JSON belongs to a different movie')
    ensure(data.get('complete') is not False and not data.get('partial'), f'{key}: use the completed reviewed lesson, not raw/partial ASR')
    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
                           'format=duration:stream=codec_type,width,height', '-of', 'json', str(source)]))
    duration = float(probe['format']['duration'])
    ensure(any(stream.get('codec_type') == 'video' for stream in probe['streams']), f'{key}: source has no video')
    ensure(number(data.get('duration')) and abs(data['duration'] - duration) < .5, f'{key}: lesson and media durations differ')
    cues = data.get('cues')
    ensure(isinstance(cues, list) and cues, f'{key}: reviewed dialogue cues are missing')
    by_id = {}
    for cue in cues:
        cue_id = cue.get('id')
        ensure(isinstance(cue_id, int) and not isinstance(cue_id, bool) and cue_id not in by_id, f'{key}: invalid or duplicate cue ID')
        ensure(number(cue.get('start')) and number(cue.get('end')) and
               0 <= cue['start'] < cue['end'] <= duration + .02, f'{key}/{cue_id}: invalid cue bounds')
        by_id[cue_id] = cue
    chapters = data.get('chapters')
    ensure(isinstance(chapters, list) and 5 <= len(chapters) <= 10, f'{key}: expected 5–10 reviewed chapters')
    uncertain = data.get('uncertain', [])
    jobs = []
    for index, chapter in enumerate(chapters):
        start, end = chapter.get('start'), chapter.get('end')
        ensure(number(start) and number(end) and 0 <= start < end <= duration + .02,
               f'{key}: invalid chapter {index + 1} bounds')
        ensure(not index or start >= chapters[index - 1]['end'] - .02, f'{key}: overlapping chapters')
        picks = chapter.get('picks')
        ensure(isinstance(picks, list) and picks, f'{key}: chapter {index + 1} has no reviewed shortlist')
        preferred = []
        for pick in picks:
            cue_id = pick.get('id') if isinstance(pick, dict) else pick
            cue = by_id.get(cue_id)
            ensure(cue and start <= cue['start'] and cue['end'] <= end,
                   f'{key}/{cue_id}: shortlisted cue is outside chapter {index + 1}')
            ensure(not needs_review(cue, uncertain), f'{key}/{cue_id}: poster shortlist contains an unreviewed/excluded cue')
            preferred.append(cue)
        # Fallback dialogue stays inside this chapter and is reviewed too.
        remaining = sorted((cue for cue in cues if start <= cue['start'] and cue['end'] <= end and
                            cue['end'] - cue['start'] >= 1 and cue['id'] not in {c['id'] for c in preferred} and
                            not needs_review(cue, uncertain)), key=lambda cue: cue['start'])
        stride = max(1, math.ceil(len(remaining) / 12))
        candidates = preferred + remaining[::stride][:12]
        jobs.append({'key': key, 'part': index + 1, 'source': source,
                     'destination': ROOT / 'assets/kino-posters' / f'{key}-{index + 1}.jpg',
                     'candidates': candidates})
    return jobs


def frame_metrics(source, time):
    pixels = run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-threads', '1',
                  '-ss', f'{time:.3f}', '-i', str(source), '-map', '0:v:0', '-an', '-frames:v', '1',
                  '-vf', 'scale=32:18,format=gray', '-threads', '1', '-f', 'rawvideo', 'pipe:1'])
    ensure(len(pixels) == 32 * 18, f'Could not decode a frame at {time:.3f}s')
    ordered = sorted(pixels)
    return {'mean': round(statistics.mean(pixels), 2),
            'contrast': ordered[int(len(ordered) * .95)] - ordered[int(len(ordered) * .05)],
            'blackFraction': round(sum(v <= 16 for v in pixels) / len(pixels), 3),
            'whiteFraction': round(sum(v >= 240 for v in pixels) / len(pixels), 3)}


def choose_frame(job):
    rejected = []
    for cue in job['candidates']:
        time = (cue['start'] + cue['end']) / 2
        metrics = frame_metrics(job['source'], time)
        if 24 <= metrics['mean'] <= 232 and metrics['contrast'] >= 30 and metrics['blackFraction'] < .8 and metrics['whiteFraction'] < .8:
            return cue, time, metrics
        rejected.append({'cueId': cue['id'], 'time': round(time, 3), **metrics})
    raise ValueError(f"{job['key']}, chapter {job['part']}: no usable mid-dialogue frame; inspect these candidates: {json.dumps(rejected)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path, default=None)
    parser.add_argument('--movie', action='append', choices=KEYS, help='Render only this movie; repeat to select multiple')
    args = parser.parse_args()
    try:
        in_dir = args.input_dir.resolve() if args.input_dir else None
        selected_keys = dict.fromkeys(args.movie or (
            [k for k in KEYS if (in_dir / f'{k}.json').is_file()] if in_dir else KEYS
        ))
        # Validate every selected movie before creating or replacing any poster.
        jobs = [job for key in selected_keys for job in prepare(key, in_dir)]
        choices = [(job, *choose_frame(job)) for job in jobs]
        report = []
        for job, cue, time, metrics in choices:
            destination = job['destination']
            destination.parent.mkdir(parents=True, exist_ok=True)
            pending = destination.with_name(destination.stem + '.pending.jpg')
            try:
                run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-threads', '1',
                     '-ss', f'{time:.3f}', '-i', str(job['source']), '-map', '0:v:0', '-an', '-frames:v', '1',
                     '-vf', FILTER, '-c:v', 'mjpeg', '-q:v', '3', '-threads', '1', str(pending)])
                ensure(pending.stat().st_size > 1024, f'{destination.name}: empty/invalid JPEG')
                pending.replace(destination)
            finally:
                if pending.exists():
                    pending.unlink()
            row = {'key': job['key'], 'part': job['part'], 'cueId': cue['id'], 'time': round(time, 3),
                   'poster': destination.relative_to(ROOT).as_posix(), **metrics}
            report.append(row)
            print(json.dumps(row), flush=True)
        report_path = ROOT / 'tmp/kino-ep2/poster-selection.json'
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
    except (ValueError, RuntimeError, OSError, KeyError, json.JSONDecodeError) as error:
        parser.error(str(error))


if __name__ == '__main__':
    main()
