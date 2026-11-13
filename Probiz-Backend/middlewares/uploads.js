const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3-v2');
const fs = require('fs');

//for aws
const AWS = require('aws-sdk');


const s3 = new AWS.S3();

//for testing the connection with s3 bucket
s3.listBuckets(function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});

//function for media uploading on aws s3 bucket
function mediaUploading() {
    return multerS3({
        s3: s3,
        bucket: "probizmanagement",
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            let ext = path.extname(file.originalname);
             let folder = file.mimetype.startsWith("video/") ? "video" : "image";
  cb(null, `${folder}/media-${Date.now()}${ext}`);
        }
    });
}

let homeloan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let homeloanrenovation = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let PlotPurchaseloan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let PlotPurchaseConstructionloan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let FlatePurchaseloan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let LoanagainstProperty = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let CommercialPropertyPurchase = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let CommercialPropertyMortgage = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
           
            callback(null, false);
        }
    }
});


let creditCard = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let carLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let businessLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let projectfundingLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});


let constructionLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let kisanCreditLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let personalLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let pradhanmantriLoan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let property = multer({
    storage: mediaUploading(),
    fileFilter: function (req, file, cb) {
      const allowedMimeTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'video/mp4',
      ];
  
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        console.log('Unsupported file type:', file.mimetype);
        cb(null, false); // silently fail
      }
    }
});
  
let balancetransfer = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});


let balancetransfertopup = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

let educationloan = multer({
    storage: mediaUploading(), // Ensure this function correctly handles all file types
    fileFilter: function (req, file, callback) {
        console.log("Uploading file:", file.originalname); // Debugging log

        // Allowed file types
        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            console.log("Only jpg, png, jpeg, and pdf files are supported");
            callback(null, false);
        }
    }
});

module.exports = {
    homeloanrenovation,
     educationloan,
    projectfundingLoan,
    CommercialPropertyMortgage,
    property,
    homeloan,
    creditCard,
    carLoan,
    businessLoan,
    constructionLoan,
    kisanCreditLoan,
    personalLoan,
    PlotPurchaseloan,
    FlatePurchaseloan,
    LoanagainstProperty,
    CommercialPropertyPurchase,
    PlotPurchaseConstructionloan,
    pradhanmantriLoan,
    balancetransfer,
    balancetransfertopup,
   
};