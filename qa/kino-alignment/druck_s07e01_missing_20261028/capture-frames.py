import pathlib,subprocess
from PIL import Image,ImageDraw
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
times=[22,39.5,145,152,218,403.8,404.9,409,487,766,867,1134]
sheet=Image.new('RGB',(1152,4*236),'white');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    target=qa/f'frame-{t:g}.jpg'
    subprocess.check_call(['ffmpeg','-v','error','-ss',str(t),'-i',str(root/'video/druck-s07e01.mp4'),'-frames:v','1','-y',str(target)])
    im=Image.open(target).convert('RGB');im.thumbnail((384,216));x=i%3*384;y=i//3*236;sheet.paste(im,(x,y+20));draw.text((x+6,y+3),f'{t:g} seconds',fill='black')
sheet.save(qa/'candidate-contact-sheet.jpg',quality=90)
