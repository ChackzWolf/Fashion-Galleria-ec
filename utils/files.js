const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
    // Construct the absolute path to the file
    const absoluteFilePath = path.join(__dirname, "..", "public", "uploaded-images", filePath);
    // Delete the file:
    fs.unlink(absoluteFilePath, (err) => {
        if (err) {
            console.error("❌ Error deleting file:", err.message);
              
        } else {
            console.log("File deleted successfully:", absoluteFilePath);
        }
    });
};

exports.deleteFile = deleteFile;