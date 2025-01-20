import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.AUTH_DB, {
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed");
  }
};

export default dbConnection;