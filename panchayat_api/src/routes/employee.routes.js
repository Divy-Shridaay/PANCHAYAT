import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create employee
router.post('/', async (req, res) => {
    try {
        console.log('Received employee data:', req.body);
        
        // REMOVED: The check for existing employeeCode 
        
        const employee = new Employee(req.body);
        const savedEmployee = await employee.save();
        console.log('Employee saved successfully:', savedEmployee._id);
        
        res.status(201).json(savedEmployee);
    } catch (error) {
        console.error('Error saving employee:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors 
        });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;