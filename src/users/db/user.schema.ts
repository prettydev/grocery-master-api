import { Schema } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new Schema(
  {
    username: { type: String },
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    phone: String,
    plan: { type: String, default: "basic" },
    role: { type: String, default: "user" },
    coins: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    email_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    
    facebook: {
      email: { type: String, unique: true },
      name: String,
      image: String,
    },
    google: {
      email: { type: String, unique: true },
      name: String,
      image: String,
    },
    expired_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

UserSchema.plugin(uniqueValidator, {
  message: "username or email already in use.",
});

export { UserSchema };
