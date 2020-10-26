import { Schema } from "mongoose";

const LoginSchema = new Schema(
  {
    user_id: { type: String },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

LoginSchema.plugin(require("mongoose-autopopulate"));

export { LoginSchema };
