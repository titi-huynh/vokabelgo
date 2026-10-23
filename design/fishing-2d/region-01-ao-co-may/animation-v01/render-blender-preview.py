"""Render the native idle study as a silent 24fps MP4, preserving the editable .blend."""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parent
scene=bpy.context.scene
scene.eevee.taa_render_samples=8
scene.render.image_settings.media_type='VIDEO'
scene.render.image_settings.file_format='FFMPEG'
scene.render.ffmpeg.format='MPEG4'
scene.render.ffmpeg.codec='H264'
scene.render.ffmpeg.constant_rate_factor='HIGH'
scene.render.ffmpeg.audio_codec='NONE'
scene.render.filepath=str(root/'ao-co-may-blender-idle-v01.mp4')
scene.frame_start=1
scene.frame_end=480
bpy.ops.render.render(animation=True)
