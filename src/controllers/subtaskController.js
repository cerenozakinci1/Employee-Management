const Subtask = require("../models/Subtask");
const Task = require("../models/Task");
const multer = require("multer");
const fs = require("fs").promises;

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const createSubtask = async (req, res) => {
  try {
    const {
      taskId,
      title,
      notes,
      startDate,
      dueDate,
      completed,
      starred,
      important,
      tags,
      users,
    } = req.body;
    const creator = req.employee._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const subtask = new Subtask({
      task: taskId,
      title,
      notes,
      startDate,
      dueDate,
      completed,
      starred,
      important,
      tags,
      users,
      creator,
      comments: [],
      files: [],
    });

    await subtask.save();

    users.forEach((user) => {
      if (!task.users.includes(user)) {
        task.users.push(user);
      }
    });

    task.subtasks.push(subtask._id);
    await task.save();

    res.status(201).json(subtask);
  } catch (error) {
    console.error("Create Subtask Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    res.status(200).json(subtask);
  } catch (error) {
    console.error("Get Subtask Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const {
      title,
      notes,
      startDate,
      dueDate,
      completed,
      starred,
      important,
      isDeleted,
      tags,
      users,
    } = req.body;

    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    subtask.title = title || subtask.title;
    subtask.notes = notes || subtask.notes;
    subtask.startDate = startDate || subtask.startDate;
    subtask.dueDate = dueDate || subtask.dueDate;
    subtask.completed = completed !== undefined ? completed : subtask.completed;
    subtask.starred = starred !== undefined ? starred : subtask.starred;
    subtask.important = important !== undefined ? important : subtask.important;
    subtask.isDeleted = isDeleted !== undefined ? isDeleted : subtask.isDeleted;
    subtask.tags = tags || subtask.tags;
    subtask.users = users || subtask.users;

    await subtask.save();

    //Ensure all users assigned to subtask are also assigned to the task
    const task = await Task.findById(subtask.task);
    if (task) {
      users.forEach((user) => {
        if (!task.users.includes(user)) {
          task.users.push(user);
        }
      });
      await task.save();
    }

    res.status(200).json(subtask);
  } catch (error) {
    console.error("Update Subtask Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const uploadFile = async (req, res) => {
  try {
    const { subtaskId } = req.params;

    upload.array("file", 5)(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "File upload error", details: err });
      }

      const subtask = await Subtask.findById(subtaskId);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }

      const files = req.files.map((file) => file.path);
      subtask.files = (subtask.files || []).concat(files);
      await subtask.save();

      res.status(200).json({ message: "Files uploaded successfully", files });
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteFile = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { path } = req.body;

    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    // Find the index of the file path in subtask.files array
    const fileIndex = subtask.files.findIndex((filePath) => filePath === path);

    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found in subtask" });
    }

    // Remove the file path from subtask.files array
    subtask.files.splice(fileIndex, 1);
    await subtask.save();

    // Delete the file from filesystem
    await fs.unlink(path); //can be removed if hard delete is not necessary

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    await Subtask.deleteOne({ _id: subtaskId });

    const task = await Task.findById(subtask.task);
    task.subtasks.pull(subtask._id);
    await task.save();

    res.status(200).json({ message: "Subtask isDeleted successfully" });
  } catch (error) {
    console.error("Delete Subtask Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createSubtask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  uploadFile,
  deleteFile,
};
