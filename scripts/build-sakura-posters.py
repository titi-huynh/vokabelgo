"""Extract catalog covers plus native 4:3 player posters, preserving the full frame."""
from pathlib import Path
import subprocess

root=Path(__file__).resolve().parents[1]
for i,t in enumerate([153.12,354.12,444.12,705.12,844.12,1006.12,1279.12,1429.12],1):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),
        '-i',str(root/'video/sakura_s01e01.mp4'),'-frames:v','1',
        '-vf','scale=720:540,pad=960:540:120:0:color=0x19131c','-q:v','3','-y',
        str(root/f'assets/kino-posters/sakura_s01e01-{i}.jpg')],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),
        '-i',str(root/'video/sakura_s01e01.mp4'),'-frames:v','1',
        '-vf','scale=960:720','-q:v','3','-y',
        str(root/f'assets/kino-posters/sakura_s01e01-native-{i}.jpg')],check=True)
