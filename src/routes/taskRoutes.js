const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUser,
  uploadFile,
  deleteFile,
} = require("../controllers/taskController");

// Existing routes
router.post("/", createTask);
router.post("/:id/upload", uploadFile);
router.post("/:id/files/delete", deleteFile);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.get("/employee/:userId", getTasksByUser);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
