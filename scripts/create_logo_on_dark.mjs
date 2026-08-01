import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const input = fileURLToPath(new URL('../public/osai-header-logo.png', import.meta.url));
const output = fileURLToPath(new URL('../public/orbit-systems-logo-on-dark.png', import.meta.url));

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const brightness = Math.max(red, green, blue);
  const darkness = 255 - Math.min(red, green, blue);

  if (brightness > 242 && darkness < 18) {
    data[index + 3] = 0;
    continue;
  }

  const isOrange = red > 170 && red > green * 1.25 && green > blue * 1.25;
  if (!isOrange) {
    data[index] = 255;
    data[index + 1] = 255;
    data[index + 2] = 255;
  }
}

await sharp(data, { raw: info }).png().toFile(output);
