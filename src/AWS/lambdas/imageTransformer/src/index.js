/* eslint-disable no-console */
const aws = require('aws-sdk');
const { ImagePool } = require('@squoosh/lib');
const { cpus } = require('os');

const numberOfCPUs = cpus().length;
console.log(`Number of CPUs: ${numberOfCPUs}.`);
const imagePool = new ImagePool(numberOfCPUs);

const s3 = new aws.S3();

const loadFile = async ({ bucket, key }) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    console.log('Loading file from S3...');
    const object = await s3.getObject(params).promise();
    console.log('Loaded file from S3.');

    return object.Body;
  } catch (error) {
    console.error(`Cannot load file from S3, bucket: ${bucket}, key: ${key}`);

    throw error;
  }
};

const uploadFile = async ({ bucket, key, binary }) => {
  const params = {
    ACL: 'bucket-owner-full-control',
    Bucket: bucket,
    Key: key,
    Body: binary
  };

  try {
    console.log('Uploading file to S3...');
    const object = await s3.putObject(params).promise();
    console.log('Uploaded file to S3.');

    return object.Body;
  } catch (error) {
    console.error(`Cannot upload file to S3, bucket: ${bucket}, key: ${key}`);

    throw error;
  }
};

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
