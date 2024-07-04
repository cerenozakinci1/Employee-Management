const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  message: { type: String, required: true },
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  isDeleted: { type: Boolean, default: false },
  isSubtask: { type: Boolean, default: false },
  replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
},
{ timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
