// authMiddleware.js
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT in authMiddleware:", decoded); // Log decoded JWT

    req.employee = decoded;

    const employee = await Employee.findById(decoded._id).select("-password");
    console.log("Found Employee in authMiddleware:", employee); // Log found employee

    if (!employee) {
      return res.status(401).json({ error: "Employee not found" });
    }

    req.employee.role = employee.role;
    req.employee.employeeId = employee.employeeId;
    next();
  } catch (err) {
    console.error("Token Error in authMiddleware:", err);
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
