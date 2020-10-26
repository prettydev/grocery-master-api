import { Schema } from "mongoose";

const BadgeSchema = new Schema(
  {
    title: { type: String, unique: true },
    kind: String,
    image: String,
    details: String,
    type: String,
    points: Number,
    rewards: String,
    difficulty: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

BadgeSchema.plugin(require("mongoose-autopopulate"));

export { BadgeSchema };
