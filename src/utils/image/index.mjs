import { cpus } from 'os';
import { ImagePool } from '@squoosh/lib';

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

export { transformImage };
