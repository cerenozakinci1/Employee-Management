const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
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
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtask" }],
    isDeleted: { type: Boolean, default: false },
    files: [String], //file path
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
