from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "og"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH = 1200
HEIGHT = 630


def load_font(size: int, *, role: str = "body") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates: list[str] = []

    if role == "title":
      candidates = [
          "/System/Library/Fonts/Supplemental/Didot.ttc",
          "/System/Library/Fonts/Supplemental/Iowan Old Style.ttc",
          "/System/Library/Fonts/NewYork.ttf",
          "/System/Library/Fonts/Supplemental/Baskerville.ttc",
          "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
      ]
    elif role == "label":
      candidates = [
          "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
          "/Library/Fonts/Arial Bold.ttf",
          "/System/Library/Fonts/Supplemental/Helvetica.ttc",
      ]
    else:
      candidates = [
          "/System/Library/Fonts/Supplemental/Helvetica.ttc",
          "/System/Library/Fonts/SFNS.ttf",
          "/Library/Fonts/Arial.ttf",
          "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
      ]

    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except Exception:
                continue

    return ImageFont.load_default()


TITLE_FONT = load_font(72, role="title")
SUBTITLE_FONT = load_font(26, role="body")
KICKER_FONT = load_font(26, role="label")
BADGE_FONT = load_font(20, role="label")
FOOTER_FONT = load_font(22, role="body")


CARDS = [
    {
        "path": OUTPUT_DIR / "home.png",
        "badge": "Home",
        "title": "Incrementality\nLab",
        "subtitle": "Interactive tools to understand where reported performance diverges from real impact.",
        "left_accent": (151, 214, 196),
        "right_accent": (242, 201, 120),
    },
    {
        "path": OUTPUT_DIR / "retargeting.png",
        "badge": "Tool",
        "title": "Retargeting\nSimulation",
        "subtitle": "See how retargeting can claim more conversions and ROAS than it actually creates.",
        "left_accent": (104, 189, 170),
        "right_accent": (229, 187, 84),
    },
    {
        "path": OUTPUT_DIR / "experiment-size.png",
        "badge": "Tool",
        "title": "Experiment Size\nCalculator",
        "subtitle": "Estimate sample size, MDE, duration, and whether your test is realistic.",
        "left_accent": (138, 212, 193),
        "right_accent": (243, 200, 122),
    },
]


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""

    for word in words:
        attempt = f"{current} {word}".strip()
        if draw.textlength(attempt, font=font) <= max_width:
            current = attempt
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def draw_vertical_gradient(draw: ImageDraw.ImageDraw) -> None:
    for y in range(HEIGHT):
        mix = y / (HEIGHT - 1)
        r = int(246 * (1 - mix) + 240 * mix)
        g = int(243 * (1 - mix) + 236 * mix)
        b = int(234 * (1 - mix) + 226 * mix)
        draw.line((0, y, WIDTH, y), fill=(r, g, b))


def create_card(card: dict[str, object]) -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), (246, 243, 234))
    draw = ImageDraw.Draw(image)

    draw_vertical_gradient(draw)

    draw.ellipse((-120, -80, 360, 340), fill=card["left_accent"])
    draw.ellipse((860, -120, 1320, 240), fill=card["right_accent"])

    card_box = (64, 64, 1136, 566)
    draw.rounded_rectangle(
        card_box,
        radius=30,
        fill=(250, 247, 241),
        outline=(221, 216, 206),
        width=2,
    )

    badge_width = 92 if card["badge"] == "Home" else 94
    badge_box = (96, 98, 96 + badge_width, 142)
    draw.rounded_rectangle(badge_box, radius=20, fill=(230, 239, 234))
    draw.text((badge_box[0] + 18, badge_box[1] + 10), str(card["badge"]), font=BADGE_FONT, fill=(28, 53, 47))

    draw.text((96, 168), "Incrementality Lab", font=KICKER_FONT, fill=(18, 94, 82))

    title_y = 216
    for line in str(card["title"]).split("\n"):
        draw.text((96, title_y), line, font=TITLE_FONT, fill=(20, 35, 29))
        title_y += 78

    subtitle_lines = wrap_text(draw, str(card["subtitle"]), SUBTITLE_FONT, 700)
    subtitle_y = 396
    for line in subtitle_lines[:3]:
        draw.text((96, subtitle_y), line, font=SUBTITLE_FONT, fill=(84, 99, 94))
        subtitle_y += 38

    footer_y = 514
    draw.line((96, footer_y, 1104, footer_y), fill=(225, 220, 212), width=2)
    draw.text((96, footer_y + 20), "lab.mzhirnov.com", font=FOOTER_FONT, fill=(84, 99, 94))

    footer_right = "Modeled clearly"
    right_text_width = draw.textlength(footer_right, font=FOOTER_FONT)
    right_x = int(1104 - right_text_width)
    draw.text((right_x, footer_y + 20), footer_right, font=FOOTER_FONT, fill=(84, 99, 94))

    image.save(Path(card["path"]))


for card in CARDS:
    create_card(card)
