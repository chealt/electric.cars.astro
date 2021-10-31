const aws = require('aws-sdk');

const s3 = new aws.S3();

exports.handler = async (event) =>
  Promise.all(
    event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      const params = {
        Bucket: bucket,
        Key: key
      };

      try {
        const S3Object = await s3.getObject(params).promise();
        console.log(S3Object);
      } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}.`;
        console.log(message);
        throw new Error(message);
      }
    })
  );
