const express = require("express");
const app = express();
const employeeRoutes = require("./src/routes/employeeRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const subtaskRoutes = require("./src/routes/subtaskRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const connectDB = require("./db/connect");
const authMiddleware = require("./src/middleware/authMiddleware");
require("dotenv").config();

app.use(express.json());

app.get("", (req, res) => {
  res.send("Task Manager");
});

// Check routes employees
app.use("/api/employees", employeeRoutes);

// Check routes tasks
app.use("/api/tasks", authMiddleware, taskRoutes);

app.use("/api/subtasks", authMiddleware, subtaskRoutes);

app.use("/api", commentRoutes);

const port = 6789;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
