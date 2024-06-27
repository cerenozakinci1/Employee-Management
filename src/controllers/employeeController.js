const Employee = require("../models/Employee");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createEmployee = async (req, res) => {
  try {
    const { employeeId, name, password, role, department } = req.body;
    const existingEmployee = await Employee.findOne({ employeeId });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      employeeId,
      name,
      password: hashedPassword,
      role,
      department
    });

    await newEmployee.save();

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};
const loginController = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: employee._id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
const getAllEmployees = async (req, res) => {
  try {
    if (req.employee.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized: Only admins can view all employees' });
    }
    const employees = await Employee.find().select('-password'); // Exclude passwords from response
    res.status(200).json(employees);
  } catch (error) {
    console.error('Get All Employees Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId }).select('-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error('Get Employee by ID Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const employees = await Employee.find({ department }).select('-password');
    if (employees.length === 0) {
      return res.status(404).json({ error: 'No employees found in this department' });
    }
    res.status(200).json(employees);
  } catch (error) {
    console.error('Get Employees By Department Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, password, department, role } = req.body;
    const loggedInEmployeeId = req.employee.employeeId;
    const loggedInUserRole = req.employee.role;

    // Fetch the employee by employeeId
    let employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Admins can update any employee's details except password
    if (loggedInUserRole === 'Admin') {
      if (name) employee.name = name;
      if (department) employee.department = department;
      if (role) employee.role = role;
      if (employeeId) employee.employeeId = employeeId;

      await employee.save();
      return res.status(200).json(employee);
    } else if (employeeId === loggedInEmployeeId) {
      // Non-admins can update their own details
      if (name) employee.name = name;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        employee.password = hashedPassword;
      }

      await employee.save();
      return res.status(200).json(employee);
    } else {
      // Non-admins cannot update other employees
      return res.status(403).json({ error: 'Unauthorized: You can only update your own information.' });
    }
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if the logged-in user is an admin
    if (req.employee.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized: Only admins can delete employees' });
    }

    const deletedEmployee = await Employee.findOneAndDelete({ employeeId });

    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully', deletedEmployee });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createEmployee, 
  deleteEmployee, 
  loginController, 
  getAllEmployees ,
  getEmployeeById, 
  getEmployeesByDepartment,
  updateEmployee
  };
