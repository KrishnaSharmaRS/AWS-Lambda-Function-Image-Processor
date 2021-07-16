const awsSecretAccessKey = "YOUR_KEY";
const awsAccessKeyId = "YOUR_KEY_ID";
const awsRegion = "us-east-2"; // REGION
const awsBucketName = "YOUR_BUCKET_NAME";
const awsBucketUrl = "https://your-bucket-url.amazonaws.com/";

const awsConfigs = {
    secretAccessKey: awsSecretAccessKey,
    accessKeyId: awsAccessKeyId,
    region: awsRegion,
};

module.exports = {
    awsSecretAccessKey,
    awsAccessKeyId,
    awsRegion,
    awsBucketName,
    awsBucketUrl,
    awsConfigs
};
