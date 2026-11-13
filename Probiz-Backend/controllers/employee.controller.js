const bcrypt = require('bcryptjs');
const Employee = require('../models/employee.model');

// POST /api/employees
exports.AddEmployee = async (req, res) => {
  try {
    const { name, mobile, email, roll, password, employeeId } = req.body;

    if (!name || !mobile || !email || !roll || !password || !employeeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists." });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new Employee({
      name,
      mobile,
      email,
      roll,
      password: hashedPassword,
      employeeId
    });

    const savedEmployee = await newEmployee.save();

    res.status(201).json({
      message: 'Employee created successfully',
      data: savedEmployee,
       status:200
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT api employees
exports.UpdateEmployee = async (req, res) => {
  try {
    const { name, mobile, email, roll, password, employeeId } = req.body;

    // Find existing employee
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update fields if provided
    if (name) employee.name = name;
    if (mobile) employee.mobile = mobile;
    if (email) employee.email = email;
    if (roll) employee.roll = roll;
    if (employeeId) employee.employeeId = employeeId;

    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await employee.save();

    res.status(200).json({
      message: 'Employee updated successfully',
      data: updatedEmployee,
       status:200
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all employees
exports.GetAllEmployee = async (req, res) => {
  try {
    // Fetch only non-deleted employees
    const employees = await Employee.find({ deleteFlag: false }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Employees get successfully',
      data: employees,
      status:200
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// DELETE  employee by ID
exports.DeleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message: 'Employee deleted',
      data: deletedEmployee
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};