import pathlib,subprocess
from PIL import Image,ImageDraw
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
times=[93,94.7,96.8,203.1,204.6,206.1,393.2,395.5,533.3,534.5,535.7,660.8]
sheet=Image.new('RGB',(960,4*205),'#f5f5f5');d=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 file=qa/f'frame-{t:.1f}.jpg'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(root/'video/erdmaennchen_schmucklose.mp4'),'-frames:v','1','-q:v','3',str(file)],check=True)
 frame=Image.open(file);frame.thumbnail((320,180));x=(i%3)*320;y=(i//3)*205;sheet.paste(frame,(x,y));d.text((x+8,y+183),f'{t:.1f}s',fill='#000000')
sheet.save(qa/'candidate-contact-sheet.jpg',quality=90)
