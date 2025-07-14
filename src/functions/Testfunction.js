const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");


const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "push-messages";


module.exports = async function (context, req) {
    try {
        context.log("📨 Received a push message request.");


        // Read and validate the request body
        const message = req.body;
        if (!message || typeof message !== "object") {
            context.log("❌ Invalid or missing JSON body.");
            context.res = {
                status: 400,
                body: "Request body must be valid JSON."
            };
            return;
        }


        // Determine folder and generate a unique filename
        const folder = req.query.folder || "default";
        const blobName = `${folder}/json_${uuidv4()}.json`;


        // Initialize Blob client
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);


        // Ensure container exists
        const exists = await containerClient.exists();
        if (!exists) {
            context.log(`ℹ️ Container '${containerName}' does not exist. Creating it.`);
            await containerClient.create();
        }


        // Upload the blob
        const blobClient = containerClient.getBlockBlobClient(blobName);
        const messageString = JSON.stringify(message, null, 2);
        await blobClient.upload(messageString, Buffer.byteLength(messageString), { overwrite: true });


        context.log(`✅ Message stored as blob: ${blobClient.url}`);
        context.res = {
            status: 201,
            body: {
                message: "JSON stored successfully",
                blobName: blobName,
                blobUrl: `${containerClient.url}/${blobName}`
            }
        };
    } catch (error) {
        context.log(`🔥 Error storing JSON: ${error.message}`);
        context.res = {
            status: 500,
            body: `Failed to store JSON: ${error.message}`
        };
    }
};

