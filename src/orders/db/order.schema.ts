import { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: { select: "username email avatar" },
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      autopopulate: { select: "asin title link main_image" },
    },
    amount: { type: Number, default: 0 },
    payer: { type: String, default: "" },
    pay_order_id: { type: String, default: "" },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

OrderSchema.plugin(require("mongoose-autopopulate"));

export { OrderSchema };
