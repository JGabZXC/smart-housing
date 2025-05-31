const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

// Your CloudFront distribution details
const cloudFrontUrl = 'https://d165ov7fy3rrtp.cloudfront.net';
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID; // Specify your key pair ID

// Generate a CloudFront Signed URL
exports.generateSignedUrl = (key) => {
  const signedUrl = getSignedUrl({
    url: `${cloudFrontUrl}/${key}`, // Full resource path
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 *24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId,
  });

  return signedUrl;
};
