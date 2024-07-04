const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createEmployee,
  deleteEmployee,
  loginController,
  getAllEmployees,
  getEmployeeById,
  getEmployeesByDepartment,
  updateEmployee,
} = require("../controllers/employeeController");

router.route("/").post(createEmployee).get(authMiddleware, getAllEmployees);
router
  .route("/:employeeId")
  .get(getEmployeeById)
  .delete(deleteEmployee, authMiddleware)
  .put(authMiddleware, updateEmployee);
router.route("/department/:department").get(getEmployeesByDepartment);
router.post("/login", loginController);

module.exports = router;
