const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./s3Bucket');

exports.uploadToS3 = async (req) => {
  let imgCover = '';
  const imgsArray = [];
  if (req.files.imageCover) {
    const filename = `project-${req.files.imageCover[0].originalname.split('.')[0]}-${Date.now()}-cover.jpeg`;
    const params = {
      Bucket: process.env.S3_NAME,
      Key: filename,
      Body: req.files.imageCover[0].buffer,
      ContentType: req.files.imageCover[0].mimetype,
    };
    const command = new PutObjectCommand(params);

    await s3.send(command);
    imgCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `project-${file.originalname.split('.')[0]}-${Date.now()}-${i + 1}.jpeg`;
        const params = {
          Bucket: process.env.S3_NAME,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);

        await s3.send(command);
        imgsArray.push(filename);
      }),
    );
  }
  return { imgCover, imgsArray };
};
