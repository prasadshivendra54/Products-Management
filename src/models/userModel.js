const { default: mongoose} = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    fname: {
        type : String, 
        required : true,
        trim : true
    },
    lname : {
        type : String, 
        required : true,
        trim : true
    },
    email : {
        type : String, 
        required : true,
        unique : true,
        trim : true,
        // valid : true
    },
    profileImage : {
        type : String, // S3 link
        required : true
    },
    phone : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        // valid : true // Indian mobnile number
    },
    password : {
        type : String,
        required : true,
        minLen : 8,
        maxLen : 15 // encrypted password
    },
    address : {
        shipping : {
            street : {
                type : String,
                required : true,
                trim : true
            },
            city : {
                type : String,
                required : true,
                trim : true
            },
            pincode : {
                type : Number,
                required : true,
                trim : true
            }
        },
        billing : {
            street : {
                type : String,
                required : true,
                trim : true
            },
            city : {
                type : String,
                required : true,
                trim : true
            },
            pincode : {
                type : Number,
                required : true,
                trim : true
            }
        }
    }
}, {timestamps : true})


// // Pre-save middleware to hash the password before saving
userSchema.pre('save', async function (next) {
    try {
      if (!this.isModified('password')) {
        return next();
      }
    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
});


module.exports = mongoose.model('User', userSchema)