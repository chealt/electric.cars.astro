import fs from 'fs';
import { promisify } from 'util';
import { transformImage } from './image/index.mjs';
import { uploadFile } from './S3/index.mjs';

const readFile = promisify(fs.readFile);

const filename = process.env.FILENAME;
const bucket = process.env.AWS_BUCKET;

const widths = [300, 600, 800];

widths.forEach(async (width) => {
  const format = 'webp';
  const imageBuffer = await readFile(filename);
  const transformedImage = await transformImage({ buffer: imageBuffer, format, width });
  const newKey = `${filename.slice(0, filename.lastIndexOf('.'))}-${width}.${transformedImage.extension}`;

  console.log(`File will be created with the filename: ${newKey}`);

  await uploadFile({ bucket, key: newKey, binary: transformedImage.buffer });

  console.log(`Image uploaded with width: ${width}, and format: ${format}`);
});
