import os, struct, zlib, math

W = H = 1024
rows = []
for y in range(H):
    row = bytearray([0])
    for x in range(W):
        # Deep navy background with blue-violet radial gradient.
        dx, dy = x - W*0.48, y - H*0.42
        d = min(1.0, math.sqrt(dx*dx + dy*dy) / 760.0)
        r = int(25 + (10-25)*d)
        g = int(99 + (28-99)*d)
        b = int(245 + (80-245)*d)
        # Rounded-square-ish darkening near corners.
        nx = abs(x-W/2)/(W/2)
        ny = abs(y-H/2)/(H/2)
        edge = max(nx, ny)
        if edge > 0.84:
            k = max(0.0, 1.0-(edge-0.84)/0.16)
            r = int(r*k); g = int(g*k); b = int(b*k)
        # Draw a clean white L.
        if 300 <= x <= 405 and 250 <= y <= 750:
            r=g=b=255
        if 390 <= x <= 710 and 645 <= y <= 750:
            r=g=b=255
        row.extend((r,g,b,255))
    rows.append(bytes(row))

raw = b''.join(rows)
def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind+data) & 0xffffffff)

png = b'\x89PNG\r\n\x1a\n'
png += chunk(b'IHDR', struct.pack(">IIBBBBB", W,H,8,6,0,0,0))
png += chunk(b'IDAT', zlib.compress(raw, 9))
png += chunk(b'IEND', b'')

os.makedirs("assets", exist_ok=True)
with open("assets/icon-1024.png","wb") as f:
    f.write(png)
print("Wrote assets/icon-1024.png")
