/* eslint-disable no-console */
const aws = require('aws-sdk');
const { ImagePool } = require('@squoosh/lib');
const { cpus } = require('os');

const imagePool = new ImagePool(cpus().length);

const s3 = new aws.S3();

const loadImage = async ({ bucket, key }) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    const object = await s3.getObject(params).promise();

    return object.Body;
  } catch (error) {
    console.error(`Cannot load image from S3, bucket: ${bucket}, key: ${key}`);

    throw error;
  }
};

exports.handler = async (event) =>
  Promise.all(
    event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/gu, ' '));
      const imageBuffer = await loadImage({ bucket, key });
      console.log('Loaded image from S3.');

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
      };
      await image.encode(encodeOptions);
      console.log('Image encoded.');

      console.log('Success');
    })
  );
