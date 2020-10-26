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
    wins: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    friends: [
      {
        friend: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          autopopulate: {
            select: "username email avatar",
          },
        },
        created_at: Date,
      },
    ],
    badges: [
      {
        badge: {
          type: Schema.Types.ObjectId,
          ref: "Badge",
          required: true,
          autopopulate: {
            select: "kind image title details type points rewards difficulty",
          },
        },
        created_at: Date,
      },
    ],
    email_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    note_channels: [String],
    note_cases: [String],

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
    twitter: {
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
