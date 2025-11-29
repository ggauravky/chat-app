import mongoose from "mongoose";

export const connectDB=async(DB_URL)=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully");
    }catch(err){
        console.log("Error connecting to database:", err);
    }
};
