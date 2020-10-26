import { Schema } from "mongoose";

const NoteSchema = new Schema(
  {
    content: String,
    receivers: [String],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

NoteSchema.plugin(require("mongoose-autopopulate"));

export { NoteSchema };
