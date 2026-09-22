"""Render metallic confetti sprites for the launch celebration.

Run headless:  blender -b --factory-startup --python scripts/launch/render-confetti.py -- <out_dir>
Produces <out_dir>/s{shape}_m{material}_f{frame}.png, stitched afterwards by build-sprite-sheet.mjs.
Each piece tumbles through FRAMES rotations so the foil catches the light as it flips.
"""
import math
import os
import sys

import bpy

OUT_DIR = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "confetti-frames"
TILE = 96
FRAMES = 12


def srgb_to_linear(hex_color):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb) + (1.0,)


# (name, base colour, metallic, roughness, coat)
MATERIALS = [
    ("gold", "#f2c14e", 1.0, 0.18, 0.0),
    ("champagne", "#f6e2b3", 0.95, 0.26, 0.0),
    ("bronze", "#a86a1c", 1.0, 0.3, 0.0),
    ("pearl", "#f7f3ea", 0.0, 0.32, 0.6),
]

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

scene.render.engine = "CYCLES"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.cycles.device = "CPU"
scene.render.film_transparent = True
scene.render.resolution_x = TILE
scene.render.resolution_y = TILE
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"

# Warm studio world so metals have something to reflect
world = bpy.data.worlds.new("Studio") if not scene.world else scene.world
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = srgb_to_linear("#fff2dc")
bg.inputs["Strength"].default_value = 0.9


def add_area_light(name, location, energy, size, color="#ffffff"):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    data.color = srgb_to_linear(color)[:3]
    light = bpy.data.objects.new(name, data)
    light.location = location
    direction = -light.location
    light.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(light)


from mathutils import Vector  # noqa: E402  (bpy must be imported first)

add_area_light("Key", Vector((-2.5, 2.0, 4.0)), 900, 2.5, "#fff4e0")
add_area_light("Fill", Vector((3.0, -1.5, 3.0)), 250, 3.0, "#ffe7c2")
add_area_light("Rim", Vector((0.5, 3.5, -1.0)), 400, 2.0, "#ffffff")

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 2.6
camera = bpy.data.objects.new("Cam", cam_data)
camera.location = (0, 0, 6)
scene.collection.objects.link(camera)
scene.camera = camera


def make_material(name, color, metallic, roughness, coat):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = srgb_to_linear(color)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    for key in ("Coat Weight", "Clearcoat"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = coat
            break
    return mat


def strip(name, length, width, segments, bend=0.0, twist=0.0):
    bpy.ops.mesh.primitive_plane_add(size=1)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (length, width, 1)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=segments)
    bpy.ops.object.mode_set(mode="OBJECT")
    if twist:
        mod = obj.modifiers.new("Twist", "SIMPLE_DEFORM")
        mod.deform_method = "TWIST"
        mod.deform_axis = "X"
        mod.angle = math.radians(twist)
    if bend:
        mod = obj.modifiers.new("Bend", "SIMPLE_DEFORM")
        mod.deform_method = "BEND"
        mod.deform_axis = "Z"
        mod.angle = math.radians(bend)
    solid = obj.modifiers.new("Thickness", "SOLIDIFY")
    solid.thickness = 0.012
    bpy.ops.object.shade_smooth()
    return obj


SHAPES = [
    lambda: strip("rect", 1.5, 0.8, 12, bend=28),       # classic confetti card
    lambda: strip("square", 1.05, 1.05, 12, bend=18),   # square foil
    lambda: strip("ribbon", 2.3, 0.26, 40, twist=300),  # curled streamer
]

os.makedirs(OUT_DIR, exist_ok=True)
materials = [make_material(*m) for m in MATERIALS]

for shape_index, build in enumerate(SHAPES):
    piece = build()
    piece.rotation_mode = "XYZ"
    for material_index, material in enumerate(materials):
        piece.data.materials.clear()
        piece.data.materials.append(material)
        for frame in range(FRAMES):
            # Tumble around the long axis plus a slight wobble so every frame catches the light differently
            angle = 2 * math.pi * frame / FRAMES
            piece.rotation_euler = (angle, 0.35 * math.sin(angle), 0.4)
            scene.render.filepath = os.path.join(OUT_DIR, f"s{shape_index}_m{material_index}_f{frame:02d}.png")
            bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(piece, do_unlink=True)

print(f"Rendered {len(SHAPES) * len(materials) * FRAMES} confetti frames to {OUT_DIR}")
