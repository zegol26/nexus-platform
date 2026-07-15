"""Build clean transparent StoryArc sprites from generated green-screen art."""

from pathlib import Path
import sys

from PIL import Image, ImageChops, ImageFilter


def clean(source_path: Path, output_path: Path) -> None:
    image = Image.open(source_path).convert("RGBA")
    red, green, blue, _ = image.split()
    dominant_green = ImageChops.subtract(green, ImageChops.lighter(red, blue))

    # Preserve skin, white fabric and dark hair. Fully remove saturated green,
    # with a narrow feathered edge for natural antialiasing.
    alpha = dominant_green.point(
        lambda value: 255 if value <= 28 else (0 if value >= 92 else 255 - round((value - 28) * 255 / 64))
    ).filter(ImageFilter.GaussianBlur(0.55))

    # Suppress green spill on edge pixels without changing fully opaque art.
    spill = dominant_green.point(lambda value: max(0, min(255, (value - 18) * 3)))
    red = ImageChops.lighter(red, spill.point(lambda value: value // 5))
    blue = ImageChops.lighter(blue, spill.point(lambda value: value // 5))
    cleaned = Image.merge("RGBA", (red, green, blue, alpha))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(output_path, "PNG", optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: clean-storyarc-sprite-alpha.py SOURCE OUTPUT")
    clean(Path(sys.argv[1]), Path(sys.argv[2]))
