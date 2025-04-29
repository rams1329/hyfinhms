// backend/controllers/degreeController.js
import degreeModel from "../models/degreeModel.js";

// Get all degrees
const getAllDegrees = async (req, res) => {
  try {
    const degrees = await degreeModel.find({}).sort({ name: 1 });
    res.json({
      success: true,
      degrees: degrees
    });
  } catch (error) {
    console.error("Error fetching degrees:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get active degrees
const getActiveDegrees = async (req, res) => {
  try {
    const degrees = await degreeModel.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      degrees: degrees
    });
  } catch (error) {
    console.error("Error fetching active degrees:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Add new degree
const addDegree = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.json({
        success: false,
        message: "Degree name is required"
      });
    }
    
    const existingDegree = await degreeModel.findOne({ name });
    if (existingDegree) {
      return res.json({
        success: false,
        message: "This degree already exists"
      });
    }
    
    const newDegree = new degreeModel({ name });
    await newDegree.save();
    
    res.json({
      success: true,
      message: "Degree added successfully",
      degree: newDegree
    });
  } catch (error) {
    console.error("Error adding degree:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Update degree
const updateDegree = async (req, res) => {
  try {
    const { id, name, active } = req.body;
    
    if (!id) {
      return res.json({
        success: false,
        message: "Degree ID is required"
      });
    }
    
    const degree = await degreeModel.findById(id);
    if (!degree) {
      return res.json({
        success: false,
        message: "Degree not found"
      });
    }
    
    if (name) {
      const existingDegree = await degreeModel.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      
      if (existingDegree) {
        return res.json({
          success: false,
          message: "This degree already exists"
        });
      }
      
      degree.name = name;
    }
    
    if (active !== undefined) {
      degree.active = active;
    }
    
    await degree.save();
    
    res.json({
      success: true,
      message: "Degree updated successfully",
      degree: degree
    });
  } catch (error) {
    console.error("Error updating degree:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Delete degree
const deleteDegree = async (req, res) => {
  try {
    const { id } = req.params;
    
    const degree = await degreeModel.findById(id);
    if (!degree) {
      return res.json({
        success: false,
        message: "Degree not found"
      });
    }
    
    await degreeModel.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: "Degree deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting degree:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

export {
  getAllDegrees,
  getActiveDegrees,
  addDegree,
  updateDegree,
  deleteDegree
};
