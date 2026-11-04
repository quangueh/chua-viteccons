"""Tao file nhac nen thien dinh bg_chant.wav cho Chua Viteccons.

Lop drone "om" 108Hz + chuong chuoi pentatonic rai thua,
fade in/out dau-cuoi de vong lap nghe mem, khong bi click.
Output: public/assets/bg_chant.wav (mono, 16000Hz, PCM16)
"""
import math
import random
import struct
import wave

SR = 16000
DUR = 72.0  # giay -> vong lap ~72s
N = int(SR * DUR)

random.seed(108)

# --- drone: 108Hz (so thieng) + quang 5 + octave, rung nhe nhu hoi tho ---
drone_parts = [
    (108.0, 0.16),
    (108.7, 0.10),  # detune tao be rong
    (162.0, 0.07),
    (216.0, 0.045),
]

# --- chuong chuoi: pentatonic, moi 7-9s mot tieng, decay 5s ---
BELLS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]
bell_events = []
t = 2.5
while t < DUR - 6:
    f = random.choice(BELLS)
    bell_events.append((t, f))
    t += random.uniform(6.5, 9.0)

samples = [0.0] * N
for i in range(N):
    tt = i / SR
    breath = 0.82 + 0.18 * math.sin(2 * math.pi * 0.045 * tt)
    v = 0.0
    for f, a in drone_parts:
        v += a * math.sin(2 * math.pi * f * tt)
    samples[i] = v * breath

for t0, f in bell_events:
    start = int(t0 * SR)
    length = int(5.0 * SR)
    for j in range(length):
        idx = start + j
        if idx >= N:
            break
        tt = j / SR
        env = math.exp(-tt / 1.6)
        tone = math.sin(2 * math.pi * f * tt) + 0.4 * math.sin(2 * math.pi * f * 2.0 * tt) * math.exp(-tt / 0.6)
        samples[idx] += 0.10 * env * tone

# fade 3s dau/cuoi -> loop muot
F = int(3.0 * SR)
for i in range(F):
    k = i / F
    samples[i] *= k
    samples[N - 1 - i] *= k

peak = max(abs(s) for s in samples) or 1.0
gain = 0.85 / peak
pcm = bytearray()
for s in samples:
    v = int(max(-1.0, min(1.0, s * gain)) * 32767)
    pcm += struct.pack("<h", v)

out = "public/assets/bg_chant.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(pcm))

import os
print(f"OK {out}  {os.path.getsize(out)/1024:.0f}KB  {DUR}s")
