// 基础的用户信息，用于鉴权和个人资料展示。
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  avatar: string;
  password: string;
  created_at: Date;
  recent_documents: {
    document: mongoose.Types.ObjectId;
    last_visited: Date;
  }[];
  starred_documents: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String },
    password: { type: String, select: false },
    recent_documents: {
      type: [
        {
          document: { type: Schema.Types.ObjectId, ref: "Document" },
          last_visited: { type: Date, default: Date.now },
        },
      ],
      select: false,
    },
    starred_documents: {
      type: [{ type: Schema.Types.ObjectId, ref: "Document" }],
      select: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.password;
        // @ts-expect-error internal fields
        delete ret.__v;
        // @ts-expect-error internal fields
        delete ret.created_at;
        // @ts-expect-error internal fields
        delete ret.updated_at;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        delete ret.password;
        // @ts-expect-error internal fields
        delete ret.__v;
        // @ts-expect-error internal fields
        delete ret.created_at;
        // @ts-expect-error internal fields
        delete ret.updated_at;
        return ret;
      },
    },
  },
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
