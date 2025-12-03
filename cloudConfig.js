const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.CLOUD_API_KEY,
api_secret: process.env.CLOUD_API_SECRET,
});






// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'webservices_DEV',
//     alloweformat:["png","jpg","jpeg"], // supports promises as well
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",   // important for videos
  },
});


module.exports = {
  cloudinary,
  storage
};