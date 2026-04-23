const fs   = require('fs');
const path = require('path');

const RATE     = 44100;
const CHANNELS = 2;
const DURATION = 14;
const N        = RATE * DURATION;
const BPM      = 118;
const B        = 60 / BPM; // beat em segundos

const samples = new Float32Array(N * CHANNELS);

// ── frequências ──
const F = {
  C2:65.41, D2:73.42, F2:87.31, G2:98.00, A2:110.00,
  C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00,
};

// ── adiciona tom ──
function tone(freq, startS, durS, vol, type = 'sine', attack = 0.02, release = 0.08) {
  const start = Math.round(startS * RATE);
  const len   = Math.round(durS * RATE);
  const atk   = Math.round(attack * RATE);
  const rel   = Math.round(release * RATE);
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx >= N) break;
    const t = i / RATE;
    let env;
    if (i < atk)          env = i / atk;
    else if (i > len-rel) env = (len - i) / rel;
    else                  env = 1;
    let w;
    if (type === 'triangle') w = (2/Math.PI) * Math.asin(Math.sin(2*Math.PI*freq*t));
    else if (type === 'soft') w = Math.sin(2*Math.PI*freq*t) * 0.7 + Math.sin(2*Math.PI*freq*2*t) * 0.2 + Math.sin(2*Math.PI*freq*3*t) * 0.1;
    else w = Math.sin(2*Math.PI*freq*t);
    const s = w * vol * env;
    samples[idx * CHANNELS]     += s;
    samples[idx * CHANNELS + 1] += s;
  }
}

// ── percussão ──
function kick(startS, vol = 0.7) {
  const start = Math.round(startS * RATE);
  const len   = Math.round(0.35 * RATE);
  for (let i = 0; i < len; i++) {
    if (start+i >= N) break;
    const t   = i / RATE;
    const env = Math.exp(-t * 14);
    const freq = 80 * Math.exp(-t * 18);
    const s   = (Math.sin(2*Math.PI*freq*t) * 0.7 + Math.sin(2*Math.PI*40*t) * 0.3) * vol * env;
    samples[(start+i)*CHANNELS]     += s;
    samples[(start+i)*CHANNELS + 1] += s;
  }
}

function snare(startS, vol = 0.35) {
  const start = Math.round(startS * RATE);
  const len   = Math.round(0.12 * RATE);
  for (let i = 0; i < len; i++) {
    if (start+i >= N) break;
    const t   = i / RATE;
    const env = Math.exp(-t * 28);
    const s   = ((Math.random()*2-1)*0.65 + Math.sin(2*Math.PI*220*t)*0.35) * vol * env;
    samples[(start+i)*CHANNELS]     += s;
    samples[(start+i)*CHANNELS + 1] += s;
  }
}

function hihat(startS, vol = 0.13, open = false) {
  const start = Math.round(startS * RATE);
  const len   = Math.round((open ? 0.12 : 0.04) * RATE);
  for (let i = 0; i < len; i++) {
    if (start+i >= N) break;
    const t   = i / RATE;
    const env = Math.exp(-t * (open ? 18 : 80));
    const s   = (Math.random()*2-1) * vol * env;
    samples[(start+i)*CHANNELS]     += s;
    samples[(start+i)*CHANNELS + 1] += s;
  }
}

// ── composição ──
// Progressão: C → Am → F → G  (pop/motivacional clássico)
// 4 compassos de 4 tempos cada = 4 * 4 * B segundos por ciclo

// Ciclo se repete 3x ao longo da música
for (let cycle = 0; cycle < 3; cycle++) {
  const T0 = cycle * 8 * B; // offset do ciclo
  const vol = cycle === 0 ? 0.08 : cycle === 1 ? 0.12 : 0.15;

  // Acordes (piano — triangle wave)
  // C major: C E G
  [[F.C4,F.E4,F.G4],[F.C4,F.E4,F.G4],[F.C4,F.E4,F.G4],[F.C4,F.E4,F.G4]].forEach((ns, bi) => {
    ns.forEach((f,ni) => tone(f, T0 + bi*B + ni*0.04, B*0.85, vol, 'soft', 0.015, 0.15));
  });
  // Am: A C E
  [[F.A3,F.C4,F.E4],[F.A3,F.C4,F.E4],[F.A3,F.C4,F.E4],[F.A3,F.C4,F.E4]].forEach((ns, bi) => {
    ns.forEach((f,ni) => tone(f, T0 + 4*B + bi*B + ni*0.04, B*0.85, vol, 'soft', 0.015, 0.15));
  });
  // F major: F A C
  [[F.F3,F.A3,F.C4],[F.F3,F.A3,F.C4],[F.F3,F.A3,F.C4],[F.F3,F.A3,F.C4]].forEach((ns, bi) => {
    ns.forEach((f,ni) => tone(f, T0 + 8*B + bi*B + ni*0.04, B*0.85, vol*1.1, 'soft', 0.015, 0.15));
  });
  // G major: G B D
  [[F.G3,F.B3,F.D4],[F.G3,F.B3,F.D4],[F.G3,F.B3,F.D4],[F.G3,F.B3,F.D4]].forEach((ns, bi) => {
    ns.forEach((f,ni) => tone(f, T0 + 12*B + bi*B + ni*0.04, B*0.85, vol*1.1, 'soft', 0.015, 0.15));
  });

  // Baixo
  const bassLine = [F.C2,F.C2,F.C2,F.C2, F.A2,F.A2,F.A2,F.A2, F.F2,F.F2,F.F2,F.F2, F.G2,F.G2,F.G2,F.G2];
  bassLine.forEach((f, bi) => tone(f, T0 + bi*B, B*0.9, vol*1.8, 'sine', 0.01, 0.1));
}

// Melodia (só no ciclo 2 e 3)
const melodyNotes = [
  [8*B,  F.E5, B*0.9],  [9*B,  F.G5, B*0.9],
  [10*B, F.A5, B*1.8],  [12*B, F.G5, B*0.9],
  [13*B, F.E5, B*0.9],  [14*B, F.F5, B*1.8],
  [16*B, F.E5, B*0.4],  [16.5*B, F.G5, B*0.4], [17*B, F.A5, B*0.9],
  [18*B, F.C5, B*1.8],  [20*B, F.G5, B*0.9],
  [21*B, F.A5, B*0.9],  [22*B, F.G5, B*0.9],   [23*B, F.E5, B*0.9],
];
melodyNotes.forEach(([t, f, d]) => { if (t < DURATION) tone(f, t, d, 0.16, 'sine', 0.02, 0.12); });

// Bateria (entra no 2º ciclo = 4 compassos = 16 tempos)
const drumStart = 16; // beat number
for (let beat = drumStart; beat < DURATION / B; beat++) {
  const t = beat * B;
  const bInBar = beat % 4;
  if (bInBar === 0 || bInBar === 2) kick(t);
  if (bInBar === 1 || bInBar === 3) snare(t);
  hihat(t, 0.10);
  hihat(t + B*0.5, 0.07);
  // Open hi-hat no fim do compasso
  if (bInBar === 3) hihat(t + B*0.75, 0.1, true);
}

// Fade in (2s) e fade out (1.5s)
const fadeIn  = Math.round(2 * RATE);
const fadeOut = Math.round(1.5 * RATE);
for (let i = 0; i < N; i++) {
  let gain = 1;
  if (i < fadeIn)  gain = i / fadeIn;
  if (i > N - fadeOut) gain = (N - i) / fadeOut;
  samples[i*CHANNELS]     *= gain;
  samples[i*CHANNELS + 1] *= gain;
}

// Normaliza
let peak = 0;
for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
const norm = 0.88 / peak;

// PCM 16-bit
const pcm = Buffer.alloc(N * CHANNELS * 2);
for (let i = 0; i < N * CHANNELS; i++) {
  const v = Math.round(samples[i] * norm * 32767);
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
}

// Header WAV
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0);  hdr.writeUInt32LE(36 + pcm.length, 4);
hdr.write('WAVE', 8);  hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20);
hdr.writeUInt16LE(CHANNELS, 22); hdr.writeUInt32LE(RATE, 24);
hdr.writeUInt32LE(RATE*CHANNELS*2, 28); hdr.writeUInt16LE(CHANNELS*2, 32);
hdr.writeUInt16LE(16, 34); hdr.write('data', 36);
hdr.writeUInt32LE(pcm.length, 40);

const OUT = path.resolve(__dirname, 'audio-motivacional.wav');
fs.writeFileSync(OUT, Buffer.concat([hdr, pcm]));
console.log('Audio gerado:', OUT);
