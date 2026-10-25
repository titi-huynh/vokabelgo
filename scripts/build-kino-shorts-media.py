"""Render the editorial Shorts with consistent loudness and source-relative captions.

Requires ffmpeg/ffprobe on PATH. --earshot adds local meter verification when
the optional earshot Python package is installed. No network services are used.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa/kino-context-shorts-2026-10-25'
OUT = ROOT / 'assets/kino-shorts'
TARGET_I, TARGET_TP, TARGET_LRA = -18, -2, 11


def run(args):
    result = subprocess.run(args, capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise RuntimeError(result.stderr[-4000:])
    return result


def meter(args):
    result = run(['ffmpeg', '-hide_banner', '-nostdin', *args, '-vn', '-af',
                  f'loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json',
                  '-f', 'null', '-'])
    return json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind('{'):])[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--earshot', action='store_true')
    opts = parser.parse_args()
    if opts.earshot:
        from earshot import api

    scenes = json.loads((QA / 'selection.json').read_text(encoding='utf-8'))
    before = {x['id']: x for x in json.loads((QA / 'audio-measurements.json').read_text(encoding='utf-8'))}
    OUT.mkdir(parents=True, exist_ok=True)
    reports = []
    for scene in scenes:
        source = ROOT / before[scene['id']]['source']
        duration = round(scene['end'] - scene['start'], 3)
        trim = ['-ss', str(scene['start']), '-i', str(source), '-t', str(duration)]
        first = meter(trim)
        normalization = (f'loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}'
                         f':measured_I={first["input_i"]}:measured_TP={first["input_tp"]}'
                         f':measured_LRA={first["input_lra"]}:measured_thresh={first["input_thresh"]}'
                         f':offset={first["target_offset"]}:linear=true:print_format=json')
        pending = OUT / f'{scene["id"]}.pending.mp4'
        run(['ffmpeg', '-hide_banner', '-nostdin', '-y', *trim,
             '-map', '0:v:0', '-map', '0:a:0', '-map_metadata', '-1',
             '-vf', 'scale=960:540:force_original_aspect_ratio=decrease:force_divisible_by=2',
             '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p', '-threads', '2',
             '-af', normalization, '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
             '-movflags', '+faststart', str(pending)])
        after = meter(['-i', str(pending)])
        if abs(float(after['input_i']) - TARGET_I) > .5 or float(after['input_tp']) > -1:
            raise RuntimeError(f'Loudness outside tolerance for {scene["id"]}: {after}')
        digest = hashlib.sha256(pending.read_bytes()).hexdigest()
        dest = OUT / f'{scene["id"]}-{digest[:10]}.mp4'
        pending.replace(dest)
        probe = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(dest)]).stdout)
        video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        actual_duration = float(video['duration'])
        if abs(actual_duration - duration) > .1:
            raise RuntimeError(f'Unexpected video duration for {scene["id"]}: {actual_duration} vs {duration}')
        scene['clipSrc'] = dest.relative_to(ROOT).as_posix()
        scene['clipDuration'] = duration
        report = {'id': scene['id'], 'source': source.relative_to(ROOT).as_posix(),
                  'sourceStart': scene['start'], 'sourceEnd': scene['end'],
                  'clipSrc': scene['clipSrc'], 'clipDuration': duration,
                  'videoDuration': actual_duration, 'width': video['width'], 'height': video['height'],
                  'bytes': dest.stat().st_size, 'sha256': digest,
                  'target': {'lufs': TARGET_I, 'truePeakDbtp': TARGET_TP, 'lra': TARGET_LRA},
                  'before': before[scene['id']]['measurements'], 'ffmpegBefore': first, 'ffmpegAfter': after}
        print(f'{scene["id"]}: {first["input_i"]} -> {after["input_i"]} LUFS, '
              f'{after["input_tp"]} dBTP, {dest.stat().st_size / 1e6:.2f} MB', flush=True)
        if opts.earshot:
            report['earshotAfter'] = api.measure(str(dest), light=True)
        reports.append(report)
        (QA / 'normalized-media.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    # Preserve the selected titles and source timestamps; only append clip fields.
    (QA / 'selection.json').write_text(json.dumps(scenes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    runtime_keys = ['id', 'videoKey', 'part', 'start', 'end', 'cueId', 'focusText', 'example',
                    'exampleVi', 'term', 'meaning', 'hook', 'tone', 'sourceUrl', 'clipSrc', 'clipDuration']
    runtime = [{key: scene[key] for key in runtime_keys} for scene in scenes]
    (ROOT / 'kino-short-scenes.js').write_text(
        '/* Curated scenes retain original subtitle/lesson timestamps.\n'
        ' * Normalized standalone clips are loaded only when a scene opens. */\n'
        'window.KinoShortScenes = Object.freeze(' + json.dumps(runtime, ensure_ascii=False, indent=2)
        + '.map(scene => Object.freeze(scene)));\n', encoding='utf-8')
    print(f'Rendered {len(reports)} normalized Shorts, {sum(x["bytes"] for x in reports)/1e6:.2f} MB total.', flush=True)


if __name__ == '__main__':
    main()
