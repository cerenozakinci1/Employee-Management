const express = require("express");
const router = express.Router();
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  replyToComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/tasks/:taskId/comments", authMiddleware, createComment);
router.post("/subtasks/:subtaskId/comments", authMiddleware, createComment);

router.get("/tasks/:taskId/comments", authMiddleware, getComments);
router.get("/subtasks/:subtaskId/comments", authMiddleware, getComments);

router.put("/comments/:commentId", authMiddleware, updateComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

router.post("/comments/:commentId/reply", authMiddleware, replyToComment);

module.exports = router;
