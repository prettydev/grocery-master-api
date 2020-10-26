import { Schema } from "mongoose";

const PointSchema = new Schema(
  {
    user_id: String,
    points: Number,
    comment: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

PointSchema.plugin(require("mongoose-autopopulate"));

export { PointSchema };
