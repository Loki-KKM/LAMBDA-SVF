const { SvfDownloader, TwoLeggedAuthenticationProvider } = require('./index'); // Ensure correct path
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const APS_CLIENT_ID = "g52vzzN7IGofaM4QAZGWARyuiBkMctsnzm5yYAEe70rQK0LJ";
const APS_CLIENT_SECRET = "1cJJ7XLtGM29MdhPjqtUWgQvBS0v2oVWvbk3lhvynf3gtZVB0wAwV7tRyAMjHdrw";
const APS_REGION = "US";
const AWS_REGION = "us-east-1"; // Change to your AWS region
const S3_BUCKET_NAME = "your-s3-bucket-name"; // Replace with your bucket name

const s3Client = new S3Client({ region: AWS_REGION });

async function uploadToS3(filePath, key) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: fileStream,
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`File uploaded successfully to S3: ${key}`);
        return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
}

async function runDownload(urn) {
    try {
        console.log("Starting download process...");
        console.log("URN:", urn);

        const authenticationProvider = new TwoLeggedAuthenticationProvider(APS_CLIENT_ID, APS_CLIENT_SECRET);
        console.log("Authentication provider initialized.");

        const downloader = new SvfDownloader(authenticationProvider);
        console.log("Downloader initialized.");

        const outputDir = "/tmp";
        const download = downloader.download(urn, { outputDir, log: console.log, region: APS_REGION });
        console.log("Download started.");

        await download.ready;
        console.log("Download completed.");

        // Get the main SVF file (you may need to customize this)
        const svfFilePath = path.join(outputDir, "output.svf"); // Adjust this path as needed
        const s3Key = `svf-files/${path.basename(svfFilePath)}`;

        const fileUrl = await uploadToS3(svfFilePath, s3Key);
        return { success: true, message: "Download completed successfully", fileUrl };
    } catch (error) {
        console.error("Error during download process:", error);
        return { success: false, message: error.message };
    }
}

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { urn } = body;

        if (!urn) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: "URN is required" }),
            };
        }

        const result = await runDownload(urn);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Lambda function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "Internal Server Error", error: error.message }),
        };
    }
};
