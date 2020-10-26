import * as mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  room_id: String,
  user_id: String,
  username: String,
  avatar: String,
  content: String,
  created_at: { type: Date, default: Date.now },
});

MessageSchema.pre("save", function (next) {
  next();
});

export { MessageSchema };
