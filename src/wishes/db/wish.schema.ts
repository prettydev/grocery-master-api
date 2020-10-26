import { Schema } from "mongoose";

const WishSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: { select: "username email avatar" },
    },
    exhibit: {
      type: Schema.Types.ObjectId,
      ref: "Exhibit",
      required: true,
      autopopulate: { select: "product" },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

WishSchema.plugin(require("mongoose-autopopulate"));

export { WishSchema };
