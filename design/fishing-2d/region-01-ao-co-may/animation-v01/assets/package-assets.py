"""Mechanical sprite packaging only. Crop cells, trim alpha-zero margins, preserve pixels."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parent
groups = {
    'cat-rig-sheet.png': {
        'head': (15, 125, 485, 515),
        'body': (500, 145, 900, 520),
        'arm-left': (910, 200, 1100, 500),
        'arm-right': (1280, 200, 1465, 500),
        'tail': (65, 600, 375, 915),
        'foot-left': (440, 650, 755, 920),
        'foot-right': (810, 650, 1115, 925),
        'dragonfly': (1165, 600, 1535, 925),
    },
    'props-sheet.png': {
        'raft': (80, 85, 1005, 455),
        'basket': (1170, 130, 1500, 455),
        'rod': (200, 470, 765, 880),
        'bait': (1195, 595, 1440, 860),
    },
}
manifest = {}
for source, parts in groups.items():
    image = Image.open(root / source).convert('RGBA')
    for name, box in parts.items():
        crop = image.crop(box)
        bbox = crop.getchannel('A').getbbox()
        if not bbox:
            raise ValueError('Empty sprite: ' + name)
        sprite = crop.crop(bbox)
        sprite.save(root / (name + '.png'))
        manifest[name] = {'file':name+'.png', 'source':source, 'crop':list(box), 'alphaTrim':list(bbox), 'size':list(sprite.size)}
if (root / 'body-v02-source.png').exists():
    correction = Image.open(root / 'body-v02-source.png').convert('RGBA')
    box = correction.getchannel('A').getbbox()
    sprite = correction.crop(box)
    sprite.save(root / 'body.png')
    manifest['body'] = {'file':'body.png','source':'body-v02-source.png','crop':list(box),'size':list(sprite.size),'note':'imagegen correction removes baked arms'}
(root / 'sprites.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({key:value['size'] for key,value in manifest.items()}, indent=2))
