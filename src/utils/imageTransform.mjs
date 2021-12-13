import { exit } from 'process';
import fs from 'fs';
import { promisify } from 'util';
import { transformImage } from './image/index.mjs';
import { uploadFile } from './S3/index.mjs';

const readFile = promisify(fs.readFile);
const getConfig = () => {
  const filename = process.env.FILENAME;
  const bucket = process.env.AWS_BUCKET;

  if (!filename) {
    throw new Error('Must provide a FILENAME env var.');
  }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('Must provide an AWS_ACCESS_KEY_ID env var.');
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Must provide an AWS_SECRET_ACCESS_KEY env var.');
  }

  if (!bucket) {
    throw new Error('Must provide a AWS_BUCKET env var.');
  }

  return {
    filename,
    AWS: { bucket },
    widths: [300, 600, 800, 'original']
  };
};

const {
  filename,
  AWS: { bucket },
  widths
} = getConfig();

await Promise.all(
  widths.map(async (width) => {
    const format = 'webp';
    const imageBuffer = await readFile(filename);
    const transformedImage = await transformImage({ buffer: imageBuffer, format, width });
    const newKey = `${filename.slice(0, filename.lastIndexOf('.'))}-${width}.${transformedImage.extension}`;

    console.log(`File will be created with the filename: ${newKey}`);

    const uploadPromise = uploadFile({ bucket, key: newKey, binary: transformedImage.buffer });

    console.log(`Image uploaded with width: ${width}, and format: ${format}`);

    return uploadPromise;
  })
);

exit();
