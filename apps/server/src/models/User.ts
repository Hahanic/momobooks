// 基础的用户信息，用于鉴权和个人资料展示。
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  avatar_url?: string;
  password_hash: string;
  created_at: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatar_url: { type: String },
    password_hash: { type: String, select: false }, // select: false 默认查询不返回密码
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const User = mongoose.model<IUser>("User", UserSchema);
