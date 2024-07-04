const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    notes: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    starred: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
    tags: [{ type: String }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    files: [String], //file path
  },
  { timestamps: true }
);

const Subtask = mongoose.model("Subtask", SubtaskSchema);

module.exports = Subtask;
