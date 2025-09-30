const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Handle S3 trigger event
        if (event.Records) {
            return await handleS3Upload(event);
        }

        // Handle API Gateway event for direct processing
        if (event.httpMethod) {
            return await handleAPIRequest(event);
        }

        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid event type' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function handleS3Upload(event) {
    const results = [];

    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        console.log(`Processing image: ${bucket}/${key}`);

        try {
            // Skip if already processed
            if (key.includes('processed/')) {
                continue;
            }

            // Get original image
            const originalImage = await s3.getObject({
                Bucket: bucket,
                Key: key
            }).promise();

            // Process multiple sizes
            const processedImages = await processImageSizes(originalImage.Body, key);

            // Upload processed images
            const uploadPromises = processedImages.map(({ buffer, fileName, metadata }) => {
                return s3.putObject({
                    Bucket: bucket,
                    Key: `processed/${fileName}`,
                    Body: buffer,
                    ContentType: 'image/webp',
                    Metadata: {
                        originalKey: key,
                        width: metadata.width.toString(),
                        height: metadata.height.toString(),
                        size: buffer.length.toString()
                    }
                }).promise();
            });

            await Promise.all(uploadPromises);

            results.push({
                originalKey: key,
                processedCount: processedImages.length,
                status: 'success'
            });

        } catch (error) {
            console.error(`Error processing ${key}:`, error);
            results.push({
                originalKey: key,
                status: 'error',
                error: error.message
            });
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Images processed',
            results
        })
    };
}

async function handleAPIRequest(event) {
    const { imageUrl, sizes } = JSON.parse(event.body || '{}');

    if (!imageUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'imageUrl is required' })
        };
    }

    try {
        // Download image from URL
        const response = await fetch(imageUrl);
        const imageBuffer = await response.buffer();

        // Process image
        const processedImages = await processImageSizes(imageBuffer, 'api-upload', sizes);

        // Return processed images as base64 or upload to S3
        const results = processedImages.map(({ buffer, fileName, metadata }) => ({
            fileName,
            size: buffer.length,
            dimensions: `${metadata.width}x${metadata.height}`,
            base64: buffer.toString('base64')
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Images processed successfully',
                images: results
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function processImageSizes(imageBuffer, originalKey, customSizes = null) {
    const baseName = originalKey.split('.')[0].split('/').pop();

    // Default sizes for exotic pets ecommerce
    const defaultSizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 300, height: 300 },
        { name: 'medium', width: 600, height: 600 },
        { name: 'large', width: 1200, height: 1200 },
        { name: 'gallery', width: 800, height: 600 },
        { name: 'hero', width: 1920, height: 1080 }
    ];

    const sizes = customSizes || defaultSizes;
    const processedImages = [];

    for (const size of sizes) {
        try {
            const processed = await sharp(imageBuffer)
                .resize(size.width, size.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 85 })
                .toBuffer({ resolveWithObject: true });

            processedImages.push({
                buffer: processed.data,
                fileName: `${baseName}-${size.name}.webp`,
                metadata: {
                    width: processed.info.width,
                    height: processed.info.height,
                    format: 'webp',
                    size: size.name
                }
            });

        } catch (error) {
            console.error(`Error processing size ${size.name}:`, error);
        }
    }

    return processedImages;
}