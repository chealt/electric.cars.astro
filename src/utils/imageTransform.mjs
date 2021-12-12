/* eslint-disable no-console */
import { cpus } from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { ImagePool } from '@squoosh/lib';

const readFile = promisify(fs.readFile);

const filename = process.env.FILENAME;

const numberOfCPUs = cpus().length;
console.log(`Number of CPUs: ${numberOfCPUs}.`);
const imagePool = new ImagePool(numberOfCPUs);

const transformImage = async ({ buffer, format, width }) => {
  const image = imagePool.ingestImage(buffer);
  await image.decoded;
  console.log('Image decoded.');

  const preprocessOptions = {
    resize: {
      enabled: true,
      width
    }
  };
  await image.preprocess(preprocessOptions);
  console.log('Image processed.');

  const encodeOptions = {
    [format]: 'auto'
  };
  await image.encode(encodeOptions);
  console.log('Image encoded.');

  const transformedImage = await image.encodedWith[format];

  transformedImage.buffer = Buffer.from(transformedImage.binary, 'binary');

  return transformedImage;
};

const widths = [300, 600, 800];

widths.forEach(async (width) => {
  const imageBuffer = await readFile(filename);
  const transformedImage = await transformImage({ buffer: imageBuffer, format: 'webp', width });
  const newKey = `${filename.slice(0, filename.lastIndexOf('.'))}-${width}.${transformedImage.extension}`;

  console.log({ newKey });
});
