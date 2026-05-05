import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const dir = 'C:/Users/joaoc/somoscenica/cartazes';
const fileUrl = `file:///${dir}/index.html`;

const browser = await puppeteer.launch({ headless: true });

// ── Square 1080×1080 (element exibido em 540px × deviceScaleFactor 2)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1400, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  const el = await page.$('.square');
  await el.screenshot({
    path: `${dir}/cartaz-square.jpg`,
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ cartaz-square.jpg  (1080×1080)');
  await page.close();
}

// ── Story 1080×1920 (element exibido em 304×540 → scale 3.553)
{
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 3.553 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  const el = await page.$('.story');
  await el.screenshot({
    path: `${dir}/cartaz-story.jpg`,
    type: 'jpeg',
    quality: 95,
  });
  console.log('✓ cartaz-story.jpg   (1080×1920)');
  await page.close();
}

await browser.close();
