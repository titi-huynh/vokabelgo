"""
Export script for Cat Island Floating Market v03.
Loads the v03 blend file and exports to GLB with optimized geometry and materials.
Also generates customer boat variations using the v03 low-poly style and shared materials.
"""

import bpy
import math
from pathlib import Path
from mathutils import Vector, Euler

BLEND_PATH = Path(r"c:\Users\huynh\OneDrive\Desktop\flash\design\cat-island-blender\v03\cat-island-floating-market-v03.blend")
OUTPUT_GLB = Path(r"c:\Users\huynh\OneDrive\Desktop\flash\assets\cat-island\cat-island-v03.glb")
OUTPUT_CUSTOMER_GLB = Path(r"c:\Users\huynh\OneDrive\Desktop\flash\assets\cat-island\customer-boat.glb")

print(f">>> Loading blend file from {BLEND_PATH}...")
bpy.ops.wm.open_mainfile(filepath=str(BLEND_PATH))

# Check objects
print(f">>> Loaded {len(bpy.data.objects)} objects.")

# Export main diorama to GLB
OUTPUT_GLB.parent.mkdir(parents=True, exist_ok=True)
print(f">>> Exporting main GLB to {OUTPUT_GLB}...")
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT_GLB),
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True
)
print(f">>> Exported main GLB: {OUTPUT_GLB.stat().st_size} bytes.")

