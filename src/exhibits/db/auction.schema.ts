/**
 * place here for easy management with exhibit
 */
import * as mongoose from "mongoose";
const Float = require("mongoose-float").loadType(mongoose, 2); //don't work on writing, work on reading

const AuctionSchema = new mongoose.Schema(
  {
    product: {
      title: String,
      asin: String,
      link: String,
      category: [String],
      image: String,
      price: { type: Float },
    },
    fund_amount: { type: Number, default: 0 },
    fund_percent: { type: Number, default: 0 },
    threshold: { type: Number, default: 0 },
    timer: Number,
    funders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          autopopulate: { select: "username email avatar" },
        },
        amount: Number,
        payer: String,
        pay_order_id: String,
      },
    ],

    /////////////----------auction specific fields---------///////////////////////////////////

    autos: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          autopopulate: { select: "username email avatar" },
        },
        value: Number,
        active: { type: Boolean, default: false },
      },
    ],
    bidders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          autopopulate: { select: "username email avatar coins" },
        },
        value: Number,
      },
    ],
    watchers: [String],
    chatters: [String],
    state: { type: String, default: "ready" },
    campaign: { type: Boolean, default: false },
    reserved: { type: Boolean, default: true },
    manual: { type: Number, default: 65535 },
    bid_started_at: { type: Date, default: Date.now },
    bid_ended_at: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

AuctionSchema.plugin(require("mongoose-autopopulate"));

export { AuctionSchema };
