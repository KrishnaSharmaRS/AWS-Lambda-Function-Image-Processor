const AWS = require("aws-sdk");
const Jimp = require("jimp");

const { awsBucketName, awsConfigs } = require("./credentials");

AWS.config.update(awsConfigs);

const s3 = new AWS.S3();

exports.handler = (event, _context, callback) => {
    // QUERY DATA:-
    if (!event.queryStringParameters) return callback(null, { error: "Invalid request!" });
    
    // QUERY DATA:-
    const { url, filename, compressedname, mimetype } = event.queryStringParameters;
    
    // QUERY DATA Validation:-
    if (!url) return callback(null, { error: "Invalid request!!" });
    if (!filename) return callback(null, { error: "Invalid request!!!" });
    if (!compressedname) return callback(null, { error: "Invalid request!!!" });
    if (mimetype !== "image/jpeg" && mimetype !== "image/png")
    return callback(null, { error: "Invalid request!!!!" });
    
    // Send Response and Process Image in Background:-
    callback(null, { message: "Processing the Image..." });
    // Send Response and Process Image in Background:-

    // STEP 1 - Download image from query URL.
    // STEP 2 - Compress the Downloaded image.
    // STEP 3 - Save Compressed Image to AWS S3 Bucket.
    // STEP 4 - Load the image to be watermarked.
    // STEP 5 - Apply Watermark to the Compressed Image (From STEP 2).
    // STEP 6 - Save the Watermarked - Compressed Image to AWS S3 Bucket.

    const jimpFunction = mimetype === "image/jpeg" ? Jimp.MIME_JPEG : Jimp.MIME_PNG;

    // ============
    //   STEP 1:-
    // ============
    Jimp.read({
        url,
    })
    .then(async (originalImage) => {
        try {
            const width = originalImage.bitmap.width > 1280 ? 1280 : originalImage.bitmap.width;
            const height = originalImage.bitmap.height / (originalImage.bitmap.width / width);
            
            // ============
            //   STEP 2:-
            // ============
            const image = originalImage
            .resize(Number(width.toFixed()), Number(height.toFixed()), jimpFunction).quality(80);
            const smallImageBuffer = await image.getBufferAsync(jimpFunction);
            
            // ============
            //   STEP 3:-
            // ============
            s3.upload(
                {
                    Bucket: awsBucketName,
                    Key: compressedname,
                    Body: smallImageBuffer,
                    ContentType: "image",
                    ContentDisposition: "attachment",
                },
                (error) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                }
                );
                    
            // ============
            //   STEP 4:-
            // ============
            const watermark = await Jimp.read("./watermark.png");
            
            // ======================================================
            //   Adjust Watermark image to be in CENTER of the Compressed Image:-
            // ======================================================
            watermark.resize(image.bitmap.width / 3, Jimp.AUTO);
            const xMargin = (image.bitmap.width - watermark.bitmap.width) / 2;
            const yMargin = (image.bitmap.height - watermark.bitmap.height) / 2;
            const X = image.bitmap.width - watermark.bitmap.width - xMargin;
            const Y = image.bitmap.height - watermark.bitmap.height - yMargin;
            
            // ============
            //   STEP 5:-
            // ============
            image.composite(
                watermark,
                X,
                Y,
                {
                    mode: Jimp.BLEND_SCREEN,
                    opacitySource: 1,
                    opacityDest: 1,
                },
                async (err, value) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    
                    try {
                        const file = await value.getBufferAsync(jimpFunction);
                        
                        const params = {
                            Bucket: awsBucketName,
                            Key: filename,
                            Body: file,
                            ContentType: "image",
                            ContentDisposition: "attachment",
                        };
                        
                        // ============
                        //   STEP 6:-
                        // ============
                        s3.upload(params, (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }
                        });
                    } catch (error) {
                        console.error(error);
                        return;
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return;
        }
    })
    .catch((error) => {
        console.error(error);
    });
};
