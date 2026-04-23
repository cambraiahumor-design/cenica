const puppeteer  = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const HTML    = path.resolve(__dirname, 'video-palestra.html');
const FRAMES  = path.resolve(__dirname, 'frames-video');
const OUT     = path.resolve(__dirname, 'video-palestra.mp4');
const FPS     = 30;
const SECONDS = 5;   // duração da animação de entrada
const HOLD    = 4;   // segundos parado no final
const TOTAL   = SECONDS + HOLD;

if (!fs.existsSync(FRAMES)) fs.mkdirSync(FRAMES);

(async () => {
  console.log('[1] Abrindo navegador...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--disable-web-security'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
  await page.goto(`file:///${HTML.replace(/\\/g, '/')}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log(`[2] Capturando ${TOTAL * FPS} frames (${TOTAL}s a ${FPS}fps)...`);
  const totalFrames = TOTAL * FPS;

  for (let i = 0; i < totalFrames; i++) {
    const t = i / FPS;
    await page.evaluate((ms) => { window._videoTime = ms; }, t * 1000);
    const file = path.join(FRAMES, `frame-${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: file });
    if (i % 30 === 0) process.stdout.write(`  frame ${i}/${totalFrames}\r`);
  }
  console.log(`\n  OK — ${totalFrames} frames capturados`);

  await browser.close();

  console.log('[3] Gerando trilha sonora...');
  execSync(`node "${path.resolve(__dirname, 'gerar-audio.js')}"`, { stdio: 'inherit' });
  const AUDIO = path.resolve(__dirname, 'audio-motivacional.wav');

  console.log('[4] Montando vídeo com áudio...');
  const cmd = `"${ffmpegPath}" -y -framerate ${FPS} -i "${FRAMES}/frame-%05d.png" -i "${AUDIO}" -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p -crf 18 -preset fast -shortest "${OUT}"`;
  execSync(cmd, { stdio: 'inherit' });

  // limpa frames
  fs.rmSync(FRAMES, { recursive: true });

  console.log(`\nVideo exportado: ${OUT}`);
})();
