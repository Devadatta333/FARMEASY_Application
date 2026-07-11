import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("MongoURL:", process.env.MongoURL);

        const connect = await mongoose.connect(process.env.MongoURL);

        console.log(
            `mongodb connected: ${connect.connection.host},
             ${connect.connection.name}`
        );
    }
    catch(error){
        console.log("MongoDB Error:");
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;