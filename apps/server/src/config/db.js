import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`,
      {
        user: process.env.MONGO_USER,
        pass: process.env.PASSWORD,
        authSource: "admin",
      },
    );
    console.log(
      "数据库连接成功",
      `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`,
    );
  } catch (error) {
    console.error("数据库连接失败:", error);
    process.exit(1);
  }
};
