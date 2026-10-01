"""Generate branded PNG icons using the classic Git-branch mark.

Recognizable at small sizes (same motif as VS Code / GitHub git-branch):
  ●
 /
●──●
Teal plate (#0d9488) matches the extension UI palette.
"""

from __future__ import annotations

import pathlib
import struct
import zlib


def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def _set_pixel(
    buf: bytearray,
    size: int,
    x: int,
    y: int,
    rgb: tuple[int, int, int],
) -> None:
    if x < 0 or y < 0 or x >= size or y >= size:
        return
    idx = y * (1 + size * 3) + 1 + x * 3
    buf[idx : idx + 3] = bytes(rgb)


def _blend(
    dst: tuple[int, int, int],
    src: tuple[int, int, int],
    alpha: float,
) -> tuple[int, int, int]:
    a = max(0.0, min(1.0, alpha))
    return (
        int(dst[0] + (src[0] - dst[0]) * a),
        int(dst[1] + (src[1] - dst[1]) * a),
        int(dst[2] + (src[2] - dst[2]) * a),
    )


def _get_pixel(
    buf: bytearray,
    size: int,
    x: int,
    y: int,
) -> tuple[int, int, int]:
    idx = y * (1 + size * 3) + 1 + x * 3
    return (buf[idx], buf[idx + 1], buf[idx + 2])


def _coverage_circle(cx: float, cy: float, r: float, x: int, y: int) -> float:
    hits = 0
    for oy in (0.25, 0.75):
        for ox in (0.25, 0.75):
            if (x + ox - cx) ** 2 + (y + oy - cy) ** 2 <= r * r:
                hits += 1
    return hits / 4.0


def _coverage_round_rect(
    x: int,
    y: int,
    size: int,
    pad: float,
    radius: float,
) -> float:
    hits = 0
    left, top, right, bottom = pad, pad, size - pad, size - pad
    for oy in (0.25, 0.75):
        for ox in (0.25, 0.75):
            px, py = x + ox, y + oy
            if px < left or py < top or px >= right or py >= bottom:
                continue
            cx0, cy0 = left + radius, top + radius
            cx1, cy1 = right - radius, top + radius
            cx2, cy2 = left + radius, bottom - radius
            cx3, cy3 = right - radius, bottom - radius
            inside = True
            if px < cx0 and py < cy0:
                inside = (px - cx0) ** 2 + (py - cy0) ** 2 <= radius * radius
            elif px > cx1 and py < cy1:
                inside = (px - cx1) ** 2 + (py - cy1) ** 2 <= radius * radius
            elif px < cx2 and py > cy2:
                inside = (px - cx2) ** 2 + (py - cy2) ** 2 <= radius * radius
            elif px > cx3 and py > cy3:
                inside = (px - cx3) ** 2 + (py - cy3) ** 2 <= radius * radius
            if inside:
                hits += 1
    return hits / 4.0


def _paint_round_rect(
    buf: bytearray,
    size: int,
    pad: float,
    radius: float,
    rgb: tuple[int, int, int],
    base: tuple[int, int, int],
) -> None:
    for y in range(size):
        for x in range(size):
            cov = _coverage_round_rect(x, y, size, pad, radius)
            if cov <= 0:
                continue
            cur = _get_pixel(buf, size, x, y)
            if cur == (0, 0, 0):
                cur = base
            _set_pixel(buf, size, x, y, _blend(cur, rgb, cov))


def _paint_circle(
    buf: bytearray,
    size: int,
    cx: float,
    cy: float,
    r: float,
    rgb: tuple[int, int, int],
) -> None:
    for y in range(size):
        for x in range(size):
            cov = _coverage_circle(cx, cy, r, x, y)
            if cov <= 0:
                continue
            cur = _get_pixel(buf, size, x, y)
            _set_pixel(buf, size, x, y, _blend(cur, rgb, cov))


def _dist_point_to_segment(
    px: float,
    py: float,
    x0: float,
    y0: float,
    x1: float,
    y1: float,
) -> float:
    dx, dy = x1 - x0, y1 - y0
    length2 = dx * dx + dy * dy
    if length2 <= 1e-9:
        return ((px - x0) ** 2 + (py - y0) ** 2) ** 0.5
    t = max(0.0, min(1.0, ((px - x0) * dx + (py - y0) * dy) / length2))
    qx, qy = x0 + t * dx, y0 + t * dy
    return ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5


def _paint_line(
    buf: bytearray,
    size: int,
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    thickness: float,
    rgb: tuple[int, int, int],
) -> None:
    half = thickness / 2.0
    for y in range(size):
        for x in range(size):
            d = _dist_point_to_segment(x + 0.5, y + 0.5, x0, y0, x1, y1)
            if d > half + 0.55:
                continue
            if d <= half - 0.35:
                cov = 1.0
            else:
                cov = 1.0 - (d - (half - 0.35)) / 0.9
            if cov <= 0:
                continue
            cur = _get_pixel(buf, size, x, y)
            _set_pixel(buf, size, x, y, _blend(cur, rgb, cov))


def render_icon(size: int) -> bytes:
    """Renders the classic three-node Git branch icon."""
    bg = (13, 148, 136)
    fg = (248, 250, 252)
    base = (248, 250, 252)

    raw = bytearray()
    for _ in range(size):
        raw.append(0)
        raw.extend(bytes(base) * size)

    _paint_round_rect(raw, size, size * 0.06, size * 0.22, bg, base)

    # Classic git-branch geometry (Y / fork, not a plain T):
    #     ● branch
    #    /
    # ●────● tip
    root = (size * 0.24, size * 0.68)
    tip = (size * 0.76, size * 0.68)
    join = (size * 0.46, size * 0.68)
    branch = (size * 0.66, size * 0.28)

    stroke = max(2.0, size * 0.08)
    node_r = max(2.4, size * 0.10)

    _paint_line(raw, size, root[0], root[1], tip[0], tip[1], stroke, fg)
    _paint_line(raw, size, join[0], join[1], branch[0], branch[1], stroke, fg)

    for cx, cy in (root, tip, branch):
        _paint_circle(raw, size, cx, cy, node_r, fg)

    return (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
        + _chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + _chunk(b"IEND", b"")
    )


def main() -> None:
    """Writes icon16/48/128.png and logo.svg under public/icons."""
    root = pathlib.Path(__file__).resolve().parents[1] / "public" / "icons"
    root.mkdir(parents=True, exist_ok=True)
    for size in (16, 48, 128):
        path = root / f"icon{size}.png"
        path.write_bytes(render_icon(size))
        print(path.name, path.stat().st_size)

    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img">
  <rect x="6" y="6" width="116" height="116" rx="28" fill="#0d9488"/>
  <g fill="none" stroke="#f8fafc" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 86 H98"/>
    <path d="M58 86 L84 36"/>
  </g>
  <g fill="#f8fafc">
    <circle cx="30" cy="86" r="12"/>
    <circle cx="98" cy="86" r="12"/>
    <circle cx="84" cy="36" r="12"/>
  </g>
</svg>
"""
    (root / "logo.svg").write_text(svg, encoding="utf-8")
    print("logo.svg written")


if __name__ == "__main__":
    main()
