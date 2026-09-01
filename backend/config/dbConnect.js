import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MongoURL;
    if (!mongoUri) {
      throw new Error("MongoDB URI is missing in environment variables.");
    }
    const connect = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${connect.connection.host} / ${connect.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;