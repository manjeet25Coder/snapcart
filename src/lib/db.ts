import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
    throw new Error("MONGODB_URL is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(mongodbUrl, opts).then((mongoose) => {
            return mongoose.connection;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("Database connection error:", error);
        throw error;
    }

    return cached.conn;
};

export default connectDb;