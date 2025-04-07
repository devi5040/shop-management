const {S3Client, PutObjectCommand} = require ('@aws-sdk/client-s3');
const logger = require ('./logger');

const s3 = new S3Client ({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  },
});

const generateAvatar = name => {
  const initials = name.slice (0, 2).toUpperCase ();

  const avatar = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#d9d9d9"/>
        <text x="50%" y="50%" font-size="40" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
    </svg>
`;
  const fileName = `${Date.now ()}-${name}.svg`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `avatars/${fileName}`,
    Body: Buffer.from (avatar, 'utf-8'),
    ContentType: 'image/svg+xml',
  };

  try {
    const command = new PutObjectCommand (uploadParams);
    s3.send (command);
    const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/avatars/${fileName}`;
    logger.info (`The file url is:${fileURL}`);
    return fileURL;
  } catch (error) {
    logger.error (`Error while generating and saving avatar ${error}`);
  }
};

const generateOrderId = () => {
  const now = new Date ();
  const date = now.toISOString ().slice (0, 10).replace (/-/g, '');
  const random = Math.floor (1000 + Math.random () * 9000);
  return `ORD-${date}-${random}`;
};

module.exports = {generateAvatar, generateOrderId};
