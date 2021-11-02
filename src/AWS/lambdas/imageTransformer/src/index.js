const { transformImage } = require('./utils/image/index.js');
const { loadFile, uploadFile, getObjectDetails } = require('./utils/S3/index.js');

exports.handler = async (event) =>
  Promise.all(
    event.Records.map(async (record) => {
      const { bucket, key } = getObjectDetails(record);
      const imageBuffer = await loadFile({ bucket, key });

      const width = 600;
      const transformedImage = await transformImage({ buffer: imageBuffer, format: 'webp', width });
      const newKey = `${key.slice(0, key.lastIndexOf('.'))}-${width}.${transformedImage.extension}`;
      await uploadFile({ bucket, key: newKey, binary: transformedImage.buffer });

      console.log('Success');
    })
  );
