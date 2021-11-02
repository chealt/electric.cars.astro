const { ImagePool } = require('@squoosh/lib');
const { cpus } = require('os');

const numberOfCPUs = cpus().length;
console.log(`Number of CPUs: ${numberOfCPUs}.`);
const imagePool = new ImagePool(numberOfCPUs);

exports.handler = async (event) =>
  Promise.all(
    event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/gu, ' '));
      const imageBuffer = await loadFile({ bucket, key });

      const image = imagePool.ingestImage(imageBuffer);
      await image.decoded;
      console.log('Image decoded.');

      const preprocessOptions = {
        resize: {
          enabled: true,
          width: 300
        }
      };
      await image.preprocess(preprocessOptions);
      console.log('Image processed.');

      const encodeOptions = {
        webp: 'auto'
        // mozjpeg: 'auto'
      };
      await image.encode(encodeOptions);
      console.log('Image encoded.');

      const rawEncodedImage = await image.encodedWith.webp;
      const newImageExtension = rawEncodedImage.extension;
      const newKey = `${key.slice(0, key.lastIndexOf('.'))}.${newImageExtension}`;
      await uploadFile({ bucket, key: newKey, binary: Buffer.from(rawEncodedImage.binary, 'binary') });

      console.log('Success');
    })
  );
