/**
 * place here for easy management with exhibit, auction
 */
import * as mongoose from "mongoose";
const Float = require("mongoose-float").loadType(mongoose, 2); //decimal places, don't work on writing, work on reading

const HistorySchema = new mongoose.Schema(
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

    /////////////----------auction specific fields---------///////////////
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: { select: "username email avatar wins points created_at" },
    },
    end_bids: Number,
    tracking: {type:String, unique:true}
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

HistorySchema.plugin(require("mongoose-autopopulate"));

export { HistorySchema };
