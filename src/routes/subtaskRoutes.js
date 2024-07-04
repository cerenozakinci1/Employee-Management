const express = require("express");
const router = express.Router();
const {
  createSubtask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  uploadFile,
  deleteFile,
} = require("../controllers/subtaskController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createSubtask);
router.post("/:subtaskId/upload", uploadFile);
router.post("/:subtaskId/files/delete", deleteFile);
router.get("/:subtaskId", authMiddleware, getSubtask);
router.put("/:subtaskId", authMiddleware, updateSubtask);
router.delete("/:subtaskId", authMiddleware, deleteSubtask);

module.exports = router;
