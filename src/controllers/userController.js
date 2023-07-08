const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const { uploadFile } = require('../aws/aws')
const bcrypt = require('bcrypt')
const validId = require('../middlewares/auth')

// To Register User - 
const userRegister = async (req, res) => {
    try {
        let files = req.files
        let userData = req.body

        if (!userData.fname && !userData.lname && !userData.email && !userData.profileImage && !userData.phone && !userData.password && !userData.address) return res.status(400).json({ status: false, message: "Please Fill All Details..(REQUIRED*)" })

        if (!userData.fname) return res.status(400).json({ status: false, message: "Please Fill Your First Name (REQUIRED*)" })
        let nameFormate = /^[A-Za-z]+$/ // this is for name validation
        if (typeof userData.fname !== "string" || !nameFormate.test(userData.name)) return res.status(400).json({ status: false, message: "Please Enter Valid Name" })
        if (userData.fname.length < 2) return res.status(400).json({ status: false, message: "First Name Must Be Morethen 2 Chareactors" })

        if (!userData.lname) return res.status(400).json({ status: false, message: "Please Fill Your Last Name (REQUIRED*)" })
        if (typeof userData.lname !== "string" || !nameFormate.test(userData.name)) return res.status(400).json({ status: false, message: "Please Enter Valid Name" })
        if (userData.lname.length < 2) return res.status(400).json({ status: false, message: "Last Name Must Be Morethen 2 Chareactors" })

        if (!userData.email) return res.status(400).json({ status: false, message: "Please Fill Email.. (REQUIRED*)" })
        let emailFormat = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // this is for email validation
        if (!emailFormat.test(userData.email)) return res.status(400).json({ status: false, message: "Please Enter Valid Email" })
        let findEmail = await userModel.find({ email: userData.email })
        if (findEmail.length > 0) return res.status(400).json({ status: false, message: `Email ${userData.email} Already Exist (Try With Another Email)` })

        // if(userData.files){ // not working
        //     if(files.length > 1){
        //         return res.status(400).send({status: false,message: "You can't enter more than one file for create "});
        //     }
        //     let productImage = await uploadFile(files[0])
        //     userData.profileImage = productImage
        // }else{
        //     return res.status(400).send({ status: false, message: "Profile Image is REQUIRED*" });
        // }
        // ProfileImage
        let uploadFileURL = await uploadFile(files[0])
        userData.profileImage = uploadFileURL

        if (!userData.phone) return res.status(400).json({ status: false, message: "Please Fill Phone Number (REQUIRED*)" })
        let numberFormate = /^\d{10}$/ // This is for number validation
        if (!numberFormate.test(userData.phone)) return res.status(400).json({ status: false, message: "Please Enter Valid Phone Number" })
        let findPhone = await userModel.find({ phone: userData.phone })
        if (findPhone.length > 0) return res.status(400).json({ status: false, message: `Phone Number ${userData.phone} Already Exist (Try With Another Phone Number)` })

        if (!userData.password) return res.status(400).json({ status: false, message: "Please Fill Password (REQUIRED*)" })
        if (userData.password.length < 8 || userData.password.length > 15) return res.status(400).json({ status: false, message: "Password Must Be Minimum 8 Charectors And Maximum 15 Charectors" })

        if (!userData.address) return res.status(400).json({ status: false, message: "Please Fill Your Address" })
        if (!userData.address.shipping) return res.status(400).json({ status: false, message: "Please Fill Your Shipping Address" })
        if (!userData.address.shipping.street && !userData.address.shipping.city && !userData.address.shipping.pincode) return res.status(400).json({ status: false, message: "Please Fill Your Complete Shipping Address" })
        if (!userData.address.billing) return res.status(400).json({ status: false, message: "Please Fill Your billing Address" })
        if (!userData.address.billing.street && !userData.address.billing.city && !userData.address.billing.pincode) return res.status(400).json({ status: false, message: "Please Fill Your Complete billing Address" })

        let data = await userModel.create(userData)
        return res.status(201).json({ status: true, message: "User created successfully", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}






// To Login User - 
const userLogin = async (req, res) => {
    try {
        let data = req.body
        let { email, password } = data

        // for email and password validate
        if (!email || !password) {
            if (!email) return res.status(400).json({ status: false, message: "Please enter your email ( कृपया अपना ईमेल डालें )" })
            if (!password) return res.status(400).json({ status: false, message: "Please enter your password ( कृपया अपना पासवर्ड डालें ! )" })
        }

        let user = await userModel.findOne({ email: email })

        // for user validate
        if (user) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (isPasswordCorrect) {
                let data = jwt.sign({ userId: user._id.toString() }, "secret-key")
                return res.status(201).json({ status: true, message: "User login successfull", data: { userId: user._id, token: data } })
            } else {
                return res.status(400).json({ status: false, message: "Email OR Password Is Incorrect ( आपका ईमेल या पासवर्ड गलत है, कृपया दोबारा प्रयास करें ! )" })
            }
        } else {
            return res.status(400).json({ status: false, message: "Email OR Password Is Incorrect ( आपका ईमेल या पासवर्ड गलत है, कृपया दोबारा प्रयास करें ! )" })
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}



// To Get User By ID - 
const getUser = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: "Please give valid userId" })
        let data = await userModel.findOne({ _id: userId }).lean()
        if (!data) return res.status(404).json({ status: false, message: "User Not Found" })
        return res.status(200).json({ status: true, message: "User profile details", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}



// To Update User By ID -
const updateUser = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: "Please give valid userId" })

        let findUserId = await userModel.findById(userId)
        if (!findUserId) return res.status(404).json({ status: false, message: "User Not Found" })

        let userData = req.body

        // Bcrypt the updated password, if provided
        if (userData.password) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
        }

        let data = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: userData },
            { new: true }
        )
        return res.status(200).json({ status: true, message: "User profile updated", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}


module.exports = {
    userRegister,
    userLogin,
    getUser,
    updateUser
}