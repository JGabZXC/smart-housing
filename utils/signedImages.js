const cloudFrontUtil = require('./cloudFront');
const getExpiresAt = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
exports.getExpiresAt = getExpiresAt;

exports.checkSignedExpiration = async (documents, modelType) => {
  const expiresAt = getExpiresAt();

  const updatedDocs = await Promise.all(
    documents.map(async (doc) => {
      const updateFields = {};

      if (
        doc.imageCover?.signedUrlExpires &&
        new Date(doc.imageCover.signedUrlExpires) < new Date()
      ) {
        updateFields["imageCover.signedUrl"] = cloudFrontUtil.generateSignedUrl(
          doc.imageCover.key
        )
        updateFields["imageCover.signedUrlExpires"] = expiresAt
      }

      const isImagesExpired =
        doc.images?.length &&
        doc.images[0].signedUrlExpires &&
        new Date(doc.images[0].signedUrlExpires) < new Date();

      if (isImagesExpired) {
        updateFields['images'] = doc.images.map((image) =>
          ({
            key: image.key,
            signedUrl: cloudFrontUtil.generateSignedUrl(image.key),
            signedUrlExpires: expiresAt,
          })
        );
      }

      if (Object.keys(updateFields).length > 0)
        return await modelType.findByIdAndUpdate(doc._id, updateFields, {
          new: true,
        });

      return null;
    })
  );

  return updatedDocs.filter(Boolean)
};

exports.signUrl = async (image) => {
  return cloudFrontUtil.generateSignedUrl(image)
}