const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const admin = require('../models/admin.model');
const user = require("../models/user.model");
const contact = require("../models/contact.model");
const news = require("../models/newslatter.model");
const Property = require("../models/property.model");
const PropertyInHouse = require("../models/inHouse.model");
const AdminRole = require('../models/adminRole.model');
const Area = require('../models/area.model');

function generateToken(userid) {
    return jwt.sign({ id: userid }, config.secret, { expiresIn: 15552000 });
}

exports.createAdmin = async (req, res) => {
    try {
        const { admin_Name, admin_Email, password } = req.body;

        // Validating email, full name, mobile number, password, and confirm password
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/;

        if (!admin_Email) {
            return res.status(400).send({ message: "Email is required", status: 400 });
        } else if (!admin_Email.match(emailRegex)) {
            return res.status(400).send({ message: "Please provide a valid Email address", status: 400 });
        }

        if (!admin_Name) {
            return res.status(400).send({ message: "admin  name is required", status: 400 });
        }



        if (!password) {
            return res.status(400).send({ message: "Password is required", status: 400 });
        }



        const checkEmail = await admin.findOne({ admin_Email }).lean();
        if (checkEmail) {
            return res.status(409).send({ message: 'Email already exists', status: 409 });
        }


        const data = await admin.create({
            admin_Name: admin_Name,
            admin_Email: admin_Email.toLowerCase(),
            password: bcrypt.hashSync(password,)
        });

        const { password: _hash, ...adminData } = data.toObject();
        return res.status(200).send({ data: adminData, message: "Congratulations! Your account has been created successfully!", status: 200 });

    } catch (error) {
        return res.status(500).send({ message: error.message || 'Some error occurred while creating an account', status: 500 });
    }
};

exports.adminLogin = (req, res) => {
    // Request validation
    if (!req.body || !req.body.admin_Email || !req.body.password) {
        return res.status(400).send({ message: 'Please provide both admin email and password.', status: 400 });
    }

    const admin_Email = req.body.admin_Email.toLowerCase();

    // Check, get, and verify login data from the database
    admin.findOne({ "admin_Email": admin_Email, deleteFlag: false })
        .then(foundAdmin => {
            if (!foundAdmin) {
                return res.status(404).send({ message: 'Email does not exist.', status: 404 });
            }

            console.log(foundAdmin)

            const passwordIsValid = bcrypt.compareSync(req.body.password, foundAdmin.password);
            if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid password!.", status: 401 });
            }

            const token = generateToken(foundAdmin._id);
            const { password, ...adminData } = foundAdmin.toObject();
            return res.status(200).send({ accessToken: token, data: adminData, status: 200 });
        })
        .catch(err => {
            res.status(500).send({ message: 'Internal server error.', status: 500 });
        });
};

exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users except those marked as deleted
        const users = await user.find({ deleteFlag: false }).select('-password'); // Exclude the password field
        const totalCount = await user.countDocuments({ deleteFlag: false }); // Count the total users

        return res.status(200).send({
            data: users,
            totalCount, // Include the total count
            message: "Users fetched successfully",
            status: 200
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message || 'An error occurred while fetching users',
            status: 500
        });
    }
};

exports.addContactUs = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newContact = new contact({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedContact = await newContact.save();
        res.status(201).json({ message: 'Contact added successfully', data: savedContact });

    } catch (error) {
        console.error('Error adding contact', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }

};

exports.getContactUs = async (req, res) => {
    try {
        const contacts = await contact.find();
        res.status(200).json({ message: 'Contacts get successfully', data: contacts });
    } catch (error) {
        console.error('Error get contacts', error);
        res.status(500).json({ error: 'Failed to get contacts' });
    }
};

exports.deleteContactUs = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedContact = await contact.findByIdAndDelete(id);

        if (!deletedContact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact deleted successfully', data: deletedContact });

    } catch (error) {
        console.error('Error deleting contact', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

// ============= News latter ======================================

exports.addNewsLetters = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'email is required' });
        }

        const newNews = new news({
            email,
        });

        // Save the art to the database
        const savedContact = await newNews.save();
        res.status(201).json({ message: 'Email added successfully', data: savedContact });

    } catch (error) {
        console.error('Error adding Email', error);
        res.status(500).json({ error: 'Failed to add Email' });
    }



};

exports.getNewsLetters = async (req, res) => {
    try {
        const newsLetters = await news.find();
        res.status(200).json({ message: 'Newsletters get successfully', data: newsLetters });
    } catch (error) {
        console.error('Error get newsletters', error);
        res.status(500).json({ error: 'Failed to get newsletters' });
    }
};

exports.deleteNewsLetter = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedNewsLetter = await news.findByIdAndDelete(id);

        if (!deletedNewsLetter) {
            return res.status(404).json({ error: 'Newsletter not found' });
        }

        res.status(200).json({ message: 'Newsletter deleted successfully', data: deletedNewsLetter });

    } catch (error) {
        console.error('Error deleting newsletter', error);
        res.status(500).json({ error: 'Failed to delete newsletter' });
    }
};

// =================== add property ==========================================
exports.AddProperty = async (req, res) => {
  try {
    const {
      ownerName,
      contactNo,
      propertyName,
      bhk_of_house,
      buildUpArea,
      propertyType,
      price,
      construction_year,
      state,
      city,
      address,
      area,
      description,
      bathrooms,
      carpetArea,
      houseFacing,
      plotArea,
      numberOfBalconies,
      furnishingStatus
    } = req.body;

    // Handle multiple images
    const propertyImage = req.files['propertyImage']
      ? req.files['propertyImage'].map(file => file.location) // or file.path if using local storage
      : [];

    // Handle single video
    const propertyVideo = req.files['propertyVideo'] && req.files['propertyVideo'][0]
      ? req.files['propertyVideo'][0].location
      : '';

    // Handle area - accept area name as string from frontend
    let areaId = null;
    let areaNameValue = '';
    
    if (area && area.trim() !== '') {
      // If area is provided, treat it as area name (string)
      areaNameValue = area.trim();
      
      // Try to find matching area in database (case-insensitive)
      const areaExists = await Area.findOne({ 
        name: { $regex: new RegExp(`^${areaNameValue}$`, 'i') },
        deleteFlag: false 
      });
      
      if (areaExists) {
        // If area found in database, store the area ID
        areaId = areaExists._id;
      }
      // If area not found in database, we still store the name (areaId will be null)
    }

    const newProperty = new Property({
      ownerName: ownerName || '',
      contactNo: contactNo || '', 
      propertyName: propertyName || '',
      bhk_of_house: bhk_of_house || '',
      buildUpArea: buildUpArea || 0,
      propertyType: propertyType || '',
      price: price || 0,
      construction_year: construction_year || 0,
      city: city || '',
      state: state || '',
      address: address || '',
      area: areaId,
      areaName: areaNameValue,
      description: description || '',
      bathrooms: bathrooms || 0,
      carpetArea: carpetArea || '',
      houseFacing: houseFacing || '',
      plotArea: plotArea || 0,
      numberOfBalconies: numberOfBalconies || 0,
      furnishingStatus: furnishingStatus || '',
      propertyImage,
      propertyVideo
    });

    await newProperty.save();
    
    // Transform property to show only area (name) and remove areaName from response
    const propertyObj = newProperty.toObject();
    propertyObj.area = propertyObj.areaName || '';
    delete propertyObj.areaName; // Remove areaName from response
    
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Property added successfully',
      data: propertyObj
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

exports.UpdatePropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const existingProperty = await Property.findById(propertyId);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const {
      ownerName,
      contactNo,
      propertyName,
      bhk_of_house,
      buildUpArea,
      propertyType,
      price,
      construction_year,
      state,
      city,
      address,
      area,
      description,
      bathrooms,
      carpetArea,
      houseFacing,
      plotArea,
      numberOfBalconies,
      furnishingStatus
    } = req.body;

    // Use new images if provided, else keep the old ones
    const propertyImage = req.files?.['propertyImage']?.length
      ? req.files['propertyImage'].map(file => file.location)
      : existingProperty.propertyImage;

    // Use new video if provided, else keep the old one
    const propertyVideo = req.files?.['propertyVideo']?.[0]
      ? req.files['propertyVideo'][0].location
      : existingProperty.propertyVideo;

    // Handle area - accept area name as string from frontend
    if (area !== undefined) {
      if (area !== null && area !== '' && area.trim() !== '') {
        // Treat area as area name (string)
        const areaNameValue = area.trim();
        
        // Try to find matching area in database (case-insensitive)
        const areaExists = await Area.findOne({ 
          name: { $regex: new RegExp(`^${areaNameValue}$`, 'i') },
          deleteFlag: false 
        });
        
        if (areaExists) {
          // If area found in database, store the area ID
          existingProperty.area = areaExists._id;
        } else {
          // If area not found in database, set area ID to null
          existingProperty.area = null;
        }
        existingProperty.areaName = areaNameValue;
      } else {
        // Allow clearing the area field
        existingProperty.area = null;
        existingProperty.areaName = '';
      }
    }

    // Update the fields
    existingProperty.ownerName = ownerName || existingProperty.ownerName;
    existingProperty.contactNo = contactNo || existingProperty.contactNo;
    existingProperty.propertyName = propertyName || existingProperty.propertyName;
    existingProperty.bhk_of_house = bhk_of_house || existingProperty.bhk_of_house;
    existingProperty.buildUpArea = buildUpArea || existingProperty.buildUpArea;
    existingProperty.propertyType = propertyType || existingProperty.propertyType;
    existingProperty.price = price || existingProperty.price;
    existingProperty.construction_year = construction_year || existingProperty.construction_year;
    existingProperty.state = state || existingProperty.state;
    existingProperty.city = city || existingProperty.city;
    existingProperty.address = address || existingProperty.address;
    existingProperty.description = description || existingProperty.description;
    existingProperty.bathrooms = bathrooms || existingProperty.bathrooms;
    existingProperty.carpetArea = carpetArea || existingProperty.carpetArea;
    existingProperty.houseFacing = houseFacing || existingProperty.houseFacing;
    existingProperty.plotArea = plotArea || existingProperty.plotArea;
    existingProperty.numberOfBalconies = numberOfBalconies || existingProperty.numberOfBalconies;
    existingProperty.furnishingStatus = furnishingStatus || existingProperty.furnishingStatus;
    existingProperty.propertyImage = propertyImage;
    existingProperty.propertyVideo = propertyVideo;

    await existingProperty.save();
    
    // Transform property to show only area (name) and remove areaName from response
    const propertyObj = existingProperty.toObject();
    propertyObj.area = propertyObj.areaName || '';
    delete propertyObj.areaName; // Remove areaName from response

    res.status(200).json({
      status:200,
      success: true,
      message: 'Property updated successfully',
      data: propertyObj
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

exports.getAllProperties = async (req, res) => {
    try {
      const properties = await Property.find()
        .sort({ createdAt: -1 }); // Most recent first
      
      // Transform properties to show only area (name) and remove areaName from response
      const transformedProperties = properties.map(property => {
        const propertyObj = property.toObject();
        propertyObj.area = propertyObj.areaName || '';
        delete propertyObj.areaName; // Remove areaName from response
        return propertyObj;
      });

      res.status(200).json({
        success: true,
        message: 'Properties get successfully',
        data: transformedProperties
      });
    } catch (err) {
      console.error('Error get properties:', err);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
}; 

exports.getPropertyById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const property = await Property.findById(id);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Transform property to show only area (name) and remove areaName from response
      const propertyObj = property.toObject();
      propertyObj.area = propertyObj.areaName || '';
      delete propertyObj.areaName; // Remove areaName from response
  
      res.status(200).json({
        success: true,
        message: 'Property get successfully',
        data: property
      });
    } catch (err) {
      console.error('Error fetching property by ID:', err);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProperty = await Property.findByIdAndDelete(id);
  
      if (!deletedProperty) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }
  
      res.status(200).json({ success: true, message: "Property deleted successfully", data: deletedProperty });
    } catch (err) {
      console.error("Error deleting property:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==================== Filter Api =========================================== 



exports.getFilteredProperties = async (req, res) => {
  try {
    const { city, propertyType, minPrice, maxPrice, areaName } = req.query;

    const match = {};

    if (city) match.city = city;
    if (propertyType) match.propertyType = propertyType;
    
    // Handle areaName filter (case-insensitive)
    if (areaName) {
      match.areaName = { $regex: new RegExp(areaName, 'i') };
    }

    // Handle price filter correctly
    if (minPrice !== undefined || maxPrice !== undefined) {
      match.price = {};
      if (minPrice !== undefined) match.price.$gte = parseInt(minPrice);
      if (maxPrice !== undefined) match.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(match);
    
    // Transform properties to show only area (name) and remove areaName from response
    const transformedProperties = properties.map(property => {
      const propertyObj = property.toObject();
      propertyObj.area = propertyObj.areaName || '';
      delete propertyObj.areaName; // Remove areaName from response
      return propertyObj;
    });

    res.status(200).json({
      success: true,
      data: transformedProperties,
    });
  } catch (err) {
    console.error("Error in getFilteredProperties:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching properties",
    });
  }
};


exports.addPropertyInHouse = async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      alternateContactNumber,
      budget,
      location,
      size,
      bhk,
      propertyType,
      width,
      length,
      houseFacing,
      loanAmountRequired,
      cashInHand
    } = req.body;

   
    const newProperty = new PropertyInHouse({
      name: name || '',
      contactNumber: contactNumber || '',
      alternateContactNumber: alternateContactNumber || '',
      budget: budget || 0,
      location: location || '',
      size: size || '',
      bhk: bhk || '',
      propertyType: propertyType || '',
      width: width || 0,
      length: length || 0,
      houseFacing: houseFacing || '',
      loanAmountRequired: loanAmountRequired || 0,
      cashInHand: cashInHand || 0
      // Add file fields here if needed
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property In House submitted successfully',
      data: newProperty
    });

  } catch (err) {
    console.error('Error saving property inquiry:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.getAllPropertyInHouse = async (req, res) => {
  try {
    
   const properties = await PropertyInHouse.find().sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: 'Get Property InHouse Successfully',
      data: properties
    });
  } catch (err) {
    console.error('Error get properties:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.getPropertyInHouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await PropertyInHouse.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property get successfully',
      data: property
    });
  } catch (err) {
    console.error('Error get property by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.deletePropertyInHouse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProperty = await PropertyInHouse.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: deletedProperty
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.updatePropertyInHouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProperty = await PropertyInHouse.findById(id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const {
      name,
      contactNumber,
      alternateContactNumber,
      budget,
      location,
      size,
      bhk,
      propertyType,
      width,
      length,
      houseFacing,
      loanAmountRequired,
      cashInHand
    } = req.body;

    

    // Assign updated fields
    existingProperty.name = name || existingProperty.name;
    existingProperty.contactNumber = contactNumber || existingProperty.contactNumber;
    existingProperty.alternateContactNumber = alternateContactNumber || existingProperty.alternateContactNumber;
    existingProperty.budget = budget || existingProperty.budget;
    existingProperty.location = location || existingProperty.location;
    existingProperty.size = size || existingProperty.size;
    existingProperty.bhk = bhk || existingProperty.bhk;
    existingProperty.propertyType = propertyType || existingProperty.propertyType;
    existingProperty.width = width || existingProperty.width;
    existingProperty.length = length || existingProperty.length;
    existingProperty.houseFacing = houseFacing || existingProperty.houseFacing;
    existingProperty.loanAmountRequired = loanAmountRequired || existingProperty.loanAmountRequired;
    existingProperty.cashInHand = cashInHand || existingProperty.cashInHand;

    
    await existingProperty.save();

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: existingProperty
    });

  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

// =========== Dash Board count ============
exports.getDashboardCounts = async (req, res) => {
  try {
    // Get current date start & end for today count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Total User Count
    const totalUserCount = await user.countDocuments();

    // Today's Added User Count
    const todayUserCount = await user.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Total Property Count
    const totalPropertyCount = await Property.countDocuments();

    // Today's Added Property Count
    const todayPropertyCount = await Property.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    return res.status(200).json({
      status: 200,
      data: {
        totalUserCount,
        todayUserCount,
        totalPropertyCount,
        todayPropertyCount
      }
    });
  } catch (error) {
    console.error("Error getting dashboard counts:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// ========== Admin Role ======================

exports.AddRole = async (req, res) => {
  try {
    const { rollName, permission } = req.body;

    if (!rollName) {
      return res.status(400).json({ message: 'Roll Name is required' });
    }

    // Validate that permission is an array of objects with tabName and tabAcess
    if (!Array.isArray(permission)) {
      return res.status(400).json({ message: 'Permission must be an array' });
    }

    const isValidPermission = permission.every(item =>
      typeof item.tabName === 'string' &&
      Array.isArray(item.tabAcess) &&
      item.tabAcess.every(access => typeof access === 'string')
    );

    if (!isValidPermission) {
      return res.status(400).json({
        message: 'Each permission must contain tabName (string) and tabAcess (array of strings)'
      });
    }

    const newRole = new AdminRole({
      rollName,
      permission
    });

    const savedRole = await newRole.save();

    res.status(201).json({
      message: 'Admin role created successfully',
      data: savedRole,
      status: 200
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.UpdateRole = async (req, res) => {
  try {
    const { rollName, permission } = req.body;

    const updateData = {};

    if (rollName) updateData.rollName = rollName;

    if (permission) {
      if (!Array.isArray(permission)) {
        return res.status(400).json({ message: 'Permission must be an array' });
      }

      const isValidPermission = permission.every(item =>
        typeof item.tabName === 'string' &&
        Array.isArray(item.tabAcess) &&
        item.tabAcess.every(access => typeof access === 'string')
      );

      if (!isValidPermission) {
        return res.status(400).json({
          message: 'Each permission must contain tabName (string) and tabAcess (array of strings)'
        });
      }

      updateData.permission = permission;
    }

    const updatedRole = await AdminRole.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.status(200).json({
      message: 'Role updated successfully',
      data: updatedRole,
      status: 200
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};



exports.DeleteRole = async (req, res) => {
  try {
    const deletedRole = await AdminRole.findByIdAndDelete(req.params.id);

    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.status(200).json({
      message: 'Role deleted successfully',
      data: deletedRole,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.GetRole = async (req, res) => {
  try {
    const roles = await AdminRole.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      message: 'Roles get successfully',
      data: roles,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ===================== Area Management =======================================
exports.bulkAddAreas = async (req, res) => {
  try {
    const { areas } = req.body;

    if (!areas || !Array.isArray(areas) || areas.length === 0) {
      return res.status(400).json({
        status: 400,
        message: 'Please provide an array of areas',
      });
    }

    const results = {
      success: [],
      failed: [],
      duplicates: [],
    };

    for (const areaData of areas) {
      try {
        // Validate required field
        if (!areaData.name || areaData.name.trim() === '') {
          results.failed.push({
            area: areaData,
            reason: 'Area name is required',
          });
          continue;
        }

        // Check if area already exists
        const existingArea = await Area.findOne({
          name: areaData.name.trim(),
          deleteFlag: false,
        });

        if (existingArea) {
          results.duplicates.push({
            name: areaData.name,
            message: 'Area already exists',
          });
          continue;
        }

        // Create new area
        const newArea = await Area.create({
          name: areaData.name.trim(),
          city: areaData.city ? areaData.city.trim() : '',
          state: areaData.state ? areaData.state.trim() : '',
          pinCode: areaData.pinCode ? areaData.pinCode.trim() : '',
          isActive: areaData.isActive !== undefined ? areaData.isActive : true,
          deleteFlag: false,
        });

        results.success.push(newArea);
      } catch (error) {
        results.failed.push({
          area: areaData,
          reason: error.message,
        });
      }
    }

    return res.status(200).json({
      status: 200,
      message: 'Bulk area import completed',
      data: {
        total: areas.length,
        success: results.success.length,
        duplicates: results.duplicates.length,
        failed: results.failed.length,
        details: {
          successful: results.success,
          duplicates: results.duplicates,
          failed: results.failed,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to bulk add areas',
      error: error.message,
    });
  }
};

exports.getAllAreas = async (req, res) => {
  try {
    const { city, state, isActive, page, limit, search } = req.query;
    const filter = { deleteFlag: false };

    // Apply filters
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Search filter (searches in name, city, state)
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { state: new RegExp(search, 'i') }
      ];
    }

    // Pagination parameters
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return res.status(400).json({
        status: 400,
        message: 'Page number must be greater than 0',
      });
    }
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        status: 400,
        message: 'Limit must be between 1 and 100',
      });
    }

    // Get total count for pagination info
    const totalCount = await Area.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch areas with pagination
    const areas = await Area.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      status: 200,
      message: 'Areas fetched successfully',
      data: areas,
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch areas',
      error: error.message,
    });
  }
};

exports.getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findOne({ _id: id, deleteFlag: false });

    if (!area) {
      return res.status(404).json({
        status: 404,
        message: 'Area not found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Area fetched successfully',
      data: area,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to fetch area',
      error: error.message,
    });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, pinCode, isActive } = req.body;

    const area = await Area.findOne({ _id: id, deleteFlag: false });

    if (!area) {
      return res.status(404).json({
        status: 404,
        message: 'Area not found',
      });
    }

    // Check if name is being updated and if it already exists
    if (name && name.trim() !== area.name) {
      const existingArea = await Area.findOne({
        name: name.trim(),
        deleteFlag: false,
        _id: { $ne: id },
      });

      if (existingArea) {
        return res.status(409).json({
          status: 409,
          message: 'Area name already exists',
        });
      }
    }

    if (name) area.name = name.trim();
    if (city !== undefined) area.city = city.trim();
    if (state !== undefined) area.state = state.trim();
    if (pinCode !== undefined) area.pinCode = pinCode.trim();
    if (isActive !== undefined) area.isActive = isActive;

    await area.save();

    return res.status(200).json({
      status: 200,
      message: 'Area updated successfully',
      data: area,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to update area',
      error: error.message,
    });
  }
};

exports.deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findOne({ _id: id, deleteFlag: false });

    if (!area) {
      return res.status(404).json({
        status: 404,
        message: 'Area not found',
      });
    }

    area.deleteFlag = true;
    await area.save();

    return res.status(200).json({
      status: 200,
      message: 'Area deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to delete area',
      error: error.message,
    });
  }
};