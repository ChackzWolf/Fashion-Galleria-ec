require('dotenv').config();
const mongoose = require('mongoose');

// Define the connection string directly as a fallback
const fallbackURI = "mongodb+srv://jacksoncheriyan05:YRCJu6YMkgCD8Tqq@cluster1.oahqgko.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
    mongoose.set("strictQuery", true);
    try {
        // Try environment variable, fallback to hardcoded URI if not available
        const uri = process.env.MONGODB_URL || fallbackURI;
        console.log("Attempting to connect with URI:", uri);
        
        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000 // Increase timeout
        };
        
        const connection = await mongoose.connect(uri, connectionOptions);
        console.log('Database connected successfully!');
        return connection;
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        console.error("Full error:", err);
        console.log("DB not connected - check your internet connection and MongoDB Atlas status");
    }
}

module.exports = connectDB;