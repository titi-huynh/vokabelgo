import pathlib,subprocess
from PIL import Image,ImageDraw
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2];times=[39.7,49,50.7,53.7,62.7,64.7,116.8,134.9,175.8,181.6]
sheet=Image.new('RGB',(960,5*290),'white');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    target=qa/f'frame-{t:g}.jpg'
    subprocess.check_call(['ffmpeg','-v','error','-ss',str(t),'-i',str(root/'video/spongebob_blubberunterricht.mp4'),'-frames:v','1','-y',str(target)])
    image=Image.open(target).convert('RGB');image.thumbnail((480,270));x=(i%2)*480;y=(i//2)*290;sheet.paste(image,(x,y+20));draw.text((x+8,y+3),f'{t:g} seconds',fill='black')
sheet.save(qa/'speaker-contact-sheet.jpg',quality=90)
