const { BlobServiceClient } = require("@azure/storage-blob");

// Load connection string from environment
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "push-messages";

module.exports = async function (context, req) {
  try {
    context.log("📥 Received a push message request.");

    // Validate and parse the incoming message
    const message = req.body;
    if (!message || !message.id) {
      context.log("❌ Invalid message format: missing 'id'.");
      context.res = {
        status: 400,
        body: "Message must contain a valid 'id'."
      };
      return;
    }

    // Create BlobServiceClient and ensure container exists
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    // Generate blob name and upload
    const blobName = `${message.id}.json`;
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const jsonMessage = JSON.stringify(message, null, 2);

    await blobClient.upload(jsonMessage, Buffer.byteLength(jsonMessage), { overwrite: true });

    context.log(`✅ Uploaded blob: ${blobName}`);

    context.res = {
      status: 200,
      body: `Message ${message.id} stored successfully.`
    };
  } catch (error) {
    context.log(`🚨 Error storing message: ${error.message}`);
    context.res = {
      status: 500,
      body: "Failed to store message"
    };
  }
};
