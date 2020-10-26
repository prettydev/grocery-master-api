import { Schema } from "mongoose";

const FriendSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: { select: "username email avatar" },
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: { select: "username email avatar" },
    },
    state: { type: Number, default: 0 }, //0: created, 1: denied
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

FriendSchema.plugin(require("mongoose-autopopulate"));

export { FriendSchema };
