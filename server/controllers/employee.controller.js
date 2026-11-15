const bcrypt = require('bcryptjs');
const { transaction } = require('../odm');
const Employee = require('../models/employee.model');

const withoutPassword = (doc) => {
  const { password, ...rest } = doc.toObject ? doc.toObject() : doc;
  return rest;
};

// POST /api/employees
exports.AddEmployee = async (req, res) => {
  try {
    const { name, mobile, email, roll, password, employeeId } = req.body;

    if (!name || !mobile || !email || !roll || !password || !employeeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Checked and created in one transaction locked on both values, so two requests cannot both succeed.
    const savedEmployee = await transaction(async (tx) => {
      await tx.lock(`unique:employee:email:${String(email).trim().toLowerCase()}`, `unique:employee:employeeId:${String(employeeId).trim()}`);
      const existing = await Employee.findOne({ $or: [{ email }, { employeeId }] });
      if (existing) return null;

      const newEmployee = new Employee({
        name,
        mobile,
        email,
        roll,
        password: hashedPassword,
        employeeId
      });

      return newEmployee.save();
    });
    if (!savedEmployee) {
      return res.status(400).json({ message: "Employee already exists." });
    }

    res.status(201).json({
      message: 'Employee created successfully',
      data: withoutPassword(savedEmployee),
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
      data: withoutPassword(updatedEmployee),
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
    const employees = await Employee.find({ deleteFlag: false }).select('-password').sort({ createdAt: -1 });

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
      data: withoutPassword(deletedEmployee)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};