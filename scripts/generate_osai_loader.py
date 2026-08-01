#!/usr/bin/env python3
"""Generate the layered, seamless OSai orbital loading animation."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    "/Users/earlpowery/Library/CloudStorage/GoogleDrive-earl@orbitsystems.ai/Shared drives/"
    "Orbit Systems Ai LLC/Brand Architecture/01 Brand Identity/01 Visual Assets/Logos/"
    "Orbit Icon/1. Main Icon/OSAI_Main-Icon_FC_Square.png"
)
GIF_OUTPUT = ROOT / "public" / "osai-logo-loader.gif"
WEBP_OUTPUT = ROOT / "public" / "osai-logo-loader.webp"

CANVAS = (800, 600)
FRAMES = 96
FRAME_MS = 42
SCALE = 2
NAVY = (52, 76, 97)
NAVY_LIGHT = (83, 111, 135)
ORANGE = (238, 137, 52)
ORANGE_LIGHT = (255, 176, 79)
SOURCE_BACKGROUND = (245, 245, 245)


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def ease(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def ramp(phase: float, start: float, end: float) -> float:
    return ease((phase - start) / (end - start))


def window(phase: float, enter: tuple[float, float], leave: tuple[float, float]) -> float:
    return ramp(phase, *enter) * (1.0 - ramp(phase, *leave))


def extract_logo(image: Image.Image) -> Image.Image:
    """Remove the pale source tile while retaining the approved artwork's edges."""
    rgba = image.convert("RGBA").crop((165, 165, 835, 835))
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            distance = math.sqrt(
                (r - SOURCE_BACKGROUND[0]) ** 2
                + (g - SOURCE_BACKGROUND[1]) ** 2
                + (b - SOURCE_BACKGROUND[2]) ** 2
            )
            coverage = clamp((distance - 4.0) / 30.0)
            pixels[x, y] = (r, g, b, round(a * coverage))
    bbox = rgba.getchannel("A").getbbox()
    return rgba.crop(bbox) if bbox else rgba


def arc_layer(
    radius: float,
    width: float,
    start: float,
    sweep: float,
    color: tuple[int, int, int],
    alpha: float,
    glow: float = 0.0,
) -> Image.Image:
    """Draw one antialiased arc with round caps on a transparent layer."""
    size = (CANVAS[0] * SCALE, CANVAS[1] * SCALE)
    layer = Image.new("RGBA", size)
    draw = ImageDraw.Draw(layer)
    cx, cy = size[0] / 2, size[1] / 2
    r, w = radius * SCALE, max(1, round(width * SCALE))
    box = (cx - r, cy - r, cx + r, cy + r)
    rgba = (*color, round(255 * clamp(alpha)))
    draw.arc(box, start=start, end=start + sweep, fill=rgba, width=w)
    cap_radius = w / 2
    for angle in (start, start + sweep):
        radians = math.radians(angle)
        x = cx + r * math.cos(radians)
        y = cy + r * math.sin(radians)
        draw.ellipse((x - cap_radius, y - cap_radius, x + cap_radius, y + cap_radius), fill=rgba)
    if glow:
        blurred = layer.filter(ImageFilter.GaussianBlur(glow * SCALE))
        blurred.alpha_composite(layer)
        return blurred
    return layer


def orbit_dot(radius: float, angle: float, size: float, color: tuple[int, int, int], alpha: float) -> Image.Image:
    canvas = (CANVAS[0] * SCALE, CANVAS[1] * SCALE)
    layer = Image.new("RGBA", canvas)
    draw = ImageDraw.Draw(layer)
    radians = math.radians(angle)
    cx = canvas[0] / 2 + radius * SCALE * math.cos(radians)
    cy = canvas[1] / 2 + radius * SCALE * math.sin(radians)
    r = size * SCALE / 2
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, round(255 * clamp(alpha))))
    glow = layer.filter(ImageFilter.GaussianBlur(7 * SCALE))
    glow.putalpha(glow.getchannel("A").point(lambda value: round(value * 0.42)))
    glow.alpha_composite(layer)
    return glow


def scaled_logo(logo: Image.Image, scale: float, alpha: float) -> Image.Image:
    size = max(1, round(282 * SCALE * scale))
    mark = logo.copy()
    mark.thumbnail((size, size), Image.Resampling.LANCZOS)
    mark.putalpha(mark.getchannel("A").point(lambda value: round(value * clamp(alpha))))
    layer = Image.new("RGBA", (CANVAS[0] * SCALE, CANVAS[1] * SCALE))
    position = ((layer.width - mark.width) // 2, (layer.height - mark.height) // 2)
    layer.alpha_composite(mark, position)
    return layer


def make_gif_frame(frame: Image.Image) -> Image.Image:
    """Reserve palette index 255 for GIF's binary transparency."""
    paletted = frame.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    mask = frame.getchannel("A").point(lambda value: 255 if value < 112 else 0).tobytes()
    pixels = bytearray(paletted.tobytes())
    for index, value in enumerate(mask):
        if value:
            pixels[index] = 255
    paletted.frombytes(bytes(pixels))
    palette = paletted.getpalette() or []
    palette.extend([0] * (768 - len(palette)))
    paletted.putpalette(palette)
    paletted.info.update(transparency=255, disposal=2)
    return paletted


def build_frame(logo: Image.Image, phase: float) -> Image.Image:
    frame = Image.new("RGBA", (CANVAS[0] * SCALE, CANVAS[1] * SCALE))

    # Ring one wakes first, expands, and rotates clockwise.
    outer_alpha = window(phase, (0.02, 0.12), (0.68, 0.82))
    outer_sweep = 18 + 296 * ramp(phase, 0.02, 0.29)
    outer_start = -92 + 310 * ramp(phase, 0.03, 0.70)
    frame.alpha_composite(arc_layer(174, 15, outer_start, outer_sweep, NAVY_LIGHT, outer_alpha, 2.2))

    # The middle ring enters later and counter-rotates, creating independent movement.
    middle_alpha = window(phase, (0.10, 0.20), (0.72, 0.86))
    middle_sweep = 14 + 304 * ramp(phase, 0.10, 0.38)
    middle_start = 100 - 430 * ramp(phase, 0.10, 0.73)
    frame.alpha_composite(arc_layer(145, 19, middle_start, middle_sweep, ORANGE_LIGHT, middle_alpha, 1.6))

    # The inner ring snaps on last, then accelerates past the slower outer systems.
    inner_alpha = window(phase, (0.19, 0.29), (0.66, 0.80))
    inner_sweep = 20 + 282 * ramp(phase, 0.19, 0.43)
    inner_start = -55 + 610 * ramp(phase, 0.19, 0.70)
    frame.alpha_composite(arc_layer(111, 23, inner_start, inner_sweep, NAVY, inner_alpha, 1.0))

    # Three pulses travel on different paths and timings instead of moving as one rigid mark.
    dot_a = window(phase, (0.00, 0.07), (0.59, 0.72))
    frame.alpha_composite(orbit_dot(174, -90 + 590 * ramp(phase, 0.00, 0.69), 21, ORANGE, dot_a))
    dot_b = window(phase, (0.14, 0.22), (0.64, 0.76))
    frame.alpha_composite(orbit_dot(145, 160 - 430 * ramp(phase, 0.14, 0.69), 15, NAVY_LIGHT, dot_b))
    dot_c = window(phase, (0.25, 0.33), (0.60, 0.72))
    frame.alpha_composite(orbit_dot(111, -40 + 720 * ramp(phase, 0.25, 0.68), 11, ORANGE_LIGHT, dot_c))

    # The independent systems converge into the exact OSai mark, hold briefly, then breathe out.
    reveal = window(phase, (0.60, 0.75), (0.91, 0.995))
    overshoot = math.sin(math.pi * ramp(phase, 0.60, 0.78)) * 0.055
    frame.alpha_composite(scaled_logo(logo, 0.86 + 0.14 * ramp(phase, 0.60, 0.75) + overshoot, reveal))

    # A final orange echo completes the handoff back to the first orbit.
    echo = window(phase, (0.73, 0.81), (0.90, 0.995))
    frame.alpha_composite(arc_layer(194, 5, -24 + 260 * ramp(phase, 0.73, 0.96), 42, ORANGE, echo, 4.5))

    return frame.resize(CANVAS, Image.Resampling.LANCZOS)


def main() -> None:
    logo = extract_logo(Image.open(SOURCE))
    frames = [build_frame(logo, index / (FRAMES - 1)) for index in range(FRAMES)]
    GIF_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    gif_frames = [make_gif_frame(frame) for frame in frames]
    gif_frames[0].save(
        GIF_OUTPUT,
        save_all=True,
        append_images=gif_frames[1:],
        duration=FRAME_MS,
        loop=0,
        disposal=2,
        optimize=True,
        transparency=255,
    )
    frames[0].save(
        WEBP_OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        lossless=False,
        quality=92,
        method=4,
    )
    print(GIF_OUTPUT)
    print(WEBP_OUTPUT)


if __name__ == "__main__":
    main()
