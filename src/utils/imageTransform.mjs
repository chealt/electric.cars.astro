import { exit } from 'process';
import fs from 'fs';
import glob from 'glob';
import { promisify } from 'util';
import { transformImage } from './image/index.mjs';
import { uploadFile } from './S3/index.mjs';

const readFile = promisify(fs.readFile);
const globAsync = promisify(glob);
const getImages = (folder) => globAsync(`${folder}/**/*.+(jpg|jpeg|webp|png|avif)`);
const getConfig = () => {
  const folder = process.env.FOLDER;
  const bucket = process.env.AWS_BUCKET;

  if (!folder) {
    throw new Error('Must provide a FOLDER env var.');
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
    folder,
    AWS: { bucket },
    widths: [300, 600, 800, 'original'],
    formats: [
      {
        squooshEncoding: 'webp',
        contentType: 'image/webp'
      },
      {
        squooshEncoding: 'mozjpeg',
        contentType: 'image/jpeg'
      }
    ]
  };
};

const {
  folder,
  AWS: { bucket },
  widths,
  formats
} = getConfig();

await Promise.all(
  widths.map(async (width) => {
    const files = await getImages(folder);

    return Promise.all(
      files.map((filename) =>
        Promise.all(
          formats.map(async ({ squooshEncoding, contentType }) => {
            const imageBuffer = await readFile(filename);
            const transformedImage = await transformImage({ buffer: imageBuffer, format: squooshEncoding, width });
            const newKey = `${filename.slice(0, filename.lastIndexOf('.'))}-${width}.${transformedImage.extension}`;

            console.log(`File will be created with the filename: ${newKey}`);

            const uploadPromise = uploadFile({
              bucket,
              key: newKey,
              binary: transformedImage.buffer,
              contentType
            }).then(() => {
              console.log(`Image uploaded with width: ${width}, and format: ${squooshEncoding}`);
            });

            return uploadPromise;
          })
        )
      )
    );
  })
);

exit();
