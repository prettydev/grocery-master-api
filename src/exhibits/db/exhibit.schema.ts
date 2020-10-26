import * as mongoose from "mongoose";
const Float = require("mongoose-float").loadType(mongoose, 2); //don't work on writing, work on reading

const ExhibitSchema = new mongoose.Schema(
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
    manual: { type: Number, default: 65535 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },  
);

ExhibitSchema.plugin(require("mongoose-autopopulate"));

export { ExhibitSchema };
