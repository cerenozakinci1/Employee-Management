const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Subtask = require("../models/Subtask");

// Create a new comment for a task or subtask
const createComment = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { message } = req.body;
    const employeeId = req.employee._id;

    const comment = new Comment({
      message,
      employee: employeeId,
      isSubtask: !!subtaskId,
    });
    await comment.save();

    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      task.comments.push(comment._id);
      await task.save();
    } else if (subtaskId) {
      const subtask = await Subtask.findById(subtaskId);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      subtask.comments.push(comment._id);
      await subtask.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all comments for a task or subtask
const getComments = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    let comments;
    if (taskId) {
      const task = await Task.findById(taskId).populate({
        path: "comments",
        match: { isDeleted: false, isSubtask: false },
        populate: { path: "employee", select: "name" },
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      comments = task.comments;
    } else if (subtaskId) {
      const subtask = await Subtask.findById(subtaskId).populate({
        path: "comments",
        match: { isDeleted: false, isSubtask: true },
        populate: { path: "employee", select: "name" },
      });
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      comments = subtask.comments;
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a comment for a task or subtask
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message, isDeleted } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.message = message || comment.message;
    comment.isDeleted = isDeleted !== undefined ? isDeleted : comment.isDeleted;

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a comment for a task or subtask
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await Task.updateOne({ $pull: { comments: commentId } });
    await Subtask.updateOne({ $pull: { comments: commentId } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;
    const employeeId = req.employee._id;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent Comment not found" });
    }

    const reply = new Comment({
      message,
      employee: employeeId,
      isSubtask: parentComment.isSubtask,
    });
    await reply.save();

    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error("Reply to Comment Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  replyToComment,
};
