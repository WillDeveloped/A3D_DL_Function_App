const { app } = require('@azure/functions');
const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "push-messages";

app.http('PushMessageToBlob', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            context.log("Received a push message request.");
            const message = await request.json();
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            // Use a unique name for the blob, e.g., a timestamp or a GUID
            const blobClient = containerClient.getBlockBlobClient(`${Date.now()}-${message.id || 'unknown'}.json`);

            const messageString = JSON.stringify(message);
            await blobClient.upload(messageString, messageString.length);

            return { status: 201, body: "Message stored successfully!" };
        } catch (error) {
            context.log(`Error storing message: ${error.message}`);
            return { status: 500, body: "Failed to store message" };
        }
    }
});