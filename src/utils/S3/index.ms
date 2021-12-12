import aws from 'aws-sdk';

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

const getObjectDetails = (S3EventRecord) => {
  const bucket = S3EventRecord.s3.bucket.name;
  const key = decodeURIComponent(S3EventRecord.s3.object.key.replace(/\+/gu, ' '));

  return { bucket, key };
};

export { loadFile, uploadFile, getObjectDetails };
