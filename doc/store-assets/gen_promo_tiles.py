"""Generate Chrome Web Store promotional tiles at exact pixel sizes (JPEG, no alpha)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
TEAL = (13, 148, 136)
TEAL_DARK = (15, 118, 110)
INK = (15, 23, 42)
MUTED = (100, 116, 139)
BG = (248, 250, 252)
WHITE = (255, 255, 255)
SOFT = (204, 251, 241)


def _font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def _draw_git_icon(draw: ImageDraw.ImageDraw, x: int, y: int, size: int) -> None:
    """Draw rounded teal plate with white git-branch mark."""
    radius = max(8, size // 5)
    draw.rounded_rectangle(
        (x, y, x + size, y + size),
        radius=radius,
        fill=TEAL,
    )
    # branch geometry scaled inside icon
    root = (x + size * 0.24, y + size * 0.68)
    tip = (x + size * 0.76, y + size * 0.68)
    join = (x + size * 0.46, y + size * 0.68)
    branch = (x + size * 0.66, y + size * 0.28)
    stroke = max(3, size // 12)
    node = max(4, size // 10)
    draw.line([root, tip], fill=WHITE, width=stroke)
    draw.line([join, branch], fill=WHITE, width=stroke)
    for cx, cy in (root, tip, branch):
        draw.ellipse(
            (cx - node, cy - node, cx + node, cy + node),
            fill=WHITE,
        )


def _fit_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def make_small_tile(path: Path) -> None:
    """440x280 small promotional tile."""
    w, h = 440, 280
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    # soft accent blob
    draw.ellipse((-40, -60, 220, 180), fill=SOFT)

    icon = 72
    ix = (w - icon) // 2
    iy = 36
    _draw_git_icon(draw, ix, iy, icon)

    title_font = _font(28, bold=True)
    sub_font = _font(15, bold=False)
    title = "GitHub → Gitee"
    sub = "Import & sync via Gitee"
    tw, th = _fit_text(draw, title, title_font)
    sw, sh = _fit_text(draw, sub, sub_font)
    draw.text(((w - tw) / 2, iy + icon + 18), title, fill=TEAL_DARK, font=title_font)
    draw.text(((w - sw) / 2, iy + icon + 18 + th + 8), sub, fill=MUTED, font=sub_font)

    img.save(path, format="JPEG", quality=92, optimize=True)
    print(path.name, img.size, path.stat().st_size)


def make_marquee(path: Path) -> None:
    """1400x560 marquee promotional tile."""
    w, h = 1400, 560
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)

    # left soft wash
    draw.ellipse((-120, -180, 620, 520), fill=SOFT)
    # right decorative panel
    draw.rounded_rectangle((820, 70, 1320, 490), radius=28, fill=WHITE, outline=(226, 232, 240), width=2)

    icon = 120
    _draw_git_icon(draw, 96, 170, icon)

    title_font = _font(64, bold=True)
    sub_font = _font(28, bold=False)
    body_font = _font(22, bold=False)
    title = "GitHub → Gitee"
    sub = "Official Gitee import · local orchestration"
    body = "Back up repositories from the GitHub page.\nTokens stay on your device."

    draw.text((96 + icon + 36, 168), title, fill=TEAL_DARK, font=title_font)
    draw.text((96 + icon + 36, 250), sub, fill=MUTED, font=sub_font)
    draw.multiline_text((96 + icon + 36, 310), body, fill=INK, font=body_font, spacing=10)

    # mock card content on the right
    card_x, card_y = 860, 120
    _draw_git_icon(draw, card_x, card_y, 48)
    card_title = _font(22, bold=True)
    card_meta = _font(16, bold=False)
    draw.text((card_x + 64, card_y + 4), "GitHub → Gitee", fill=TEAL_DARK, font=card_title)
    draw.text((card_x + 64, card_y + 34), "example / awesome-lib", fill=MUTED, font=card_meta)

    draw.rounded_rectangle((card_x, 220, 1280, 270), radius=14, fill=(240, 253, 250))
    draw.ellipse((card_x + 18, 238, card_x + 30, 250), fill=TEAL)
    draw.text((card_x + 42, 232), "Not imported yet", fill=TEAL_DARK, font=card_meta)

    draw.rounded_rectangle((card_x, 300, 1160, 360), radius=12, fill=TEAL)
    btn_font = _font(20, bold=True)
    btn = "Import to Gitee"
    bw, bh = _fit_text(draw, btn, btn_font)
    draw.text((card_x + (300 - bw) / 2, 300 + (60 - bh) / 2), btn, fill=WHITE, font=btn_font)

    draw.rounded_rectangle((card_x, 380, 1160, 430), radius=12, fill=BG, outline=(226, 232, 240), width=2)
    draw.text((card_x + 24, 394), "Already imported, register", fill=INK, font=card_meta)

    img.save(path, format="JPEG", quality=92, optimize=True)
    print(path.name, img.size, path.stat().st_size)


def main() -> None:
    make_small_tile(ROOT / "promo-small-440x280.jpg")
    make_marquee(ROOT / "promo-marquee-1400x560.jpg")


if __name__ == "__main__":
    main()
