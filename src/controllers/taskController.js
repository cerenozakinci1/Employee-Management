const Task = require("../models/Task");
const Subtask = require("../models/Subtask");
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

// Create a new task
const createTask = async (req, res) => {
  try {
    const {
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

    const task = new Task({
      title,
      creator,
      notes,
      startDate,
      dueDate,
      completed,
      starred,
      important,
      tags,
      users,
      comments: [],
      files: [], // Initialize files as an empty array
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isDeleted: false })
      .populate("users", "name")
      .populate("comments.employee", "name");
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
//Get every task that a specific user has
const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const tasks = await Task.find({ users: userId }).populate(
      "users",
      "-password"
    );

    if (!tasks.length) {
      return res.status(404).json({ error: "No tasks found for this user" });
    }

    const taskIds = tasks.map((task) => task._id);
    const subtasks = await Subtask.find({
      task: { $in: taskIds },
      users: userId,
    });

    const tasksWithSubtasks = tasks.map((task) => ({
      ...task.toObject(),
      subtasks: subtasks.filter(
        (subtask) => subtask.task.toString() === task._id.toString()
      ),
    }));

    res.status(200).json(tasksWithSubtasks);
  } catch (error) {
    console.error("Get Tasks By User Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("users", "name")
      .populate("comments.employee", "name");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Get Task By ID Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
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

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.title = title || task.title;
    task.notes = notes || task.notes;
    task.startDate = startDate || task.startDate;
    task.dueDate = dueDate || task.dueDate;
    task.completed = completed !== undefined ? completed : task.completed;
    task.starred = starred !== undefined ? starred : task.starred;
    task.important = important !== undefined ? important : task.important;
    task.isDeleted = isDeleted !== undefined ? isDeleted : task.isDeleted;
    task.tags = tags || task.tags;
    task.users = users || task.users;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;

    upload.array("file", 5)(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "File upload error", details: err });
      }

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const files = req.files.map((file) => file.path);
      task.files = (task.files || []).concat(files);
      await task.save();

      res.status(200).json({ message: "Files uploaded successfully", files });
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { path } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    //Find the index of the file path in task.files array
    const fileIndex = task.files.findIndex((filePath) => filePath === path);

    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found in task" });
    }

    //Remove the file path from task.files array-delete
    task.files.splice(fileIndex, 1);
    await task.save();

    {
      // Delete the file from filesystem
      await fs.unlink(path);
    } //can be removed if hard delete is not necessary

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await Subtask.deleteMany({ task: id });
    await Task.deleteOne({ _id: id });

    res
      .status(200)
      .json({ message: "Task and its subtasks deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUser,
  uploadFile,
  deleteFile,
};
