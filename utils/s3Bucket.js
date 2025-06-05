const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: process.env.S3_REGION,
});

const deleteObject = async (entity) => {
  if (entity.imageCover?.key) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_NAME,
        Key: entity.imageCover.key,
      }),
    );
  }

  if (entity.images && entity.images.length > 0) {
    await Promise.all(
      entity.images.map(async (image) => {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_NAME,
            Key: image.key,
          }),
        );
      }),
    );
  }
};

const uploadToS3 = async (req) => {
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

module.exports = {
  s3,
  deleteObject,
  uploadToS3,
};
