const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "push-messages";

module.exports = async function (context, req) {
    try {
        context.log("Received a push message request.");
        const message = req.body;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(`${message.id}.json`);

        await blobClient.upload(JSON.stringify(message), message.length, { overwrite: true });

        context.res = { status: 200, body: "Message stored successfully!" };
 } catch (error) {
    context.log(`Error storing message: ${error.message}`);
    context.res = { status: 500, body: "Failed to store message" };
}
};