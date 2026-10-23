"""Read-only originals; disposable compression/audio pilots in the research folder."""
from pathlib import Path
import json,subprocess
root=Path(__file__).resolve().parents[1]
out=root/'qa/kino-performance-research';out.mkdir(parents=True,exist_ok=True)
source=root/'video/sakura_s01e01.mp4'
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',*args],check=True)
audio=out/'sakura-audio-only.mp4'  # Audio-only ISO MP4: existing local server supports Range on .mp4.
run(['-i',str(source),'-vn','-c:a','copy','-movflags','+faststart','-y',str(audio)])
frames=json.loads(subprocess.check_output(['ffprobe','-v','error','-skip_frame','nokey','-select_streams','v:0','-read_intervals','1100%+20','-show_entries','frame=best_effort_timestamp_time','-of','json',str(source)],text=True))['frames']
start=next(float(f['best_effort_timestamp_time']) for f in frames if float(f['best_effort_timestamp_time'])>=1100)
sample=out/'source-sample.mp4'
run(['-ss',str(start),'-i',str(source),'-t','60','-map','0:v:0','-map','0:a:0','-c','copy','-movflags','+faststart','-y',str(sample)])
rows=[]
for name,scale,crf in [('sample-720p-crf26.mp4','960:720',26),('sample-480p-crf24.mp4','640:480',24)]:
    target=out/name
    run(['-i',str(sample),'-vf','scale='+scale,'-c:v','libx264','-preset','fast','-crf',str(crf),'-threads','2','-c:a','copy','-movflags','+faststart','-y',str(target)])
    rows.append(dict(file=name,size=target.stat().st_size,reductionPercent=round(100*(1-target.stat().st_size/sample.stat().st_size),2),settings=dict(scale=scale,crf=crf,preset='fast',audio='copy')))
    print(json.dumps(rows[-1]),flush=True)
def audio_hash(p):
    return subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(p),'-map','0:a:0','-c','copy','-f','streamhash','-hash','sha256','-'],text=True).strip()
result=dict(originalBytes=source.stat().st_size,audioOnlyBytes=audio.stat().st_size,audioOnlyReductionPercent=round(100*(1-audio.stat().st_size/source.stat().st_size),2),audioBitstreamUnchanged=audio_hash(source)==audio_hash(audio),sampleStart=start,sampleOriginalBytes=sample.stat().st_size,sampleTargetSeconds=60,variants=rows,limitations='One 60-second action sample, not a whole-film size guarantee or human audio/visual review. No app source or original video changed.')
(out/'encode-pilot.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result),flush=True)
