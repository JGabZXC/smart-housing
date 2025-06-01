const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

// Generate a CloudFront Signed URL
exports.generateSignedUrl = (key) => {
  const signedUrl = getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`, // Full resource path
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 *24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
  });

  return signedUrl;
};
