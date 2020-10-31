import { Schema } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new Schema(
  {
    name: { type: String },
    image: String,
    email: { type: String, trim: true, index: true, unique: true, sparse: true },
    email_verified: { type: Boolean, default: false },

    password: String,
    
    plan: { type: String, default: "basic" },
    role: { type: String, default: "user" },
    
    coins: { type: Number, default: 0 },
    points: { type: Number, default: 0 },

    total_order: {type: Number, default: 0},
    total_order_amount: {type: Number, default: 0},
    
    address: {
      type: [{
        id: String,
        type: String,
        name: String,
        info: String,
      }],
      default: []
    },    
    contact: {
      type: [{
        id: String,
        type: String,
        number: String,
        }],
      default:[]
    },
    card: {
      type: [{
        id: String,
        type: String,
        cardType: String,
        name: String,
        lastFourDigit: Number,
      }],
      default: []
    },

    facebook: {
      email: { type: String, trim: true, index: true, unique: true, sparse: true },
      name: String,
      image: String,
    },
    google: {
      email: { type: String, trim: true, index: true, unique: true, sparse: true },
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
