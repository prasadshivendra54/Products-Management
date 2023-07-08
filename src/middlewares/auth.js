const { default: mongoose } = require("mongoose");
const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
const objectId = require('mongoose').Types.ObjectId


// For Check ID is Valid Or Not - 
const isValidObjectId = (id) =>{
    if(objectId.isValid(id)){
        if((String)(new objectId(id)) == id) return true
        return false
    }
    return false
}


// For Authentication - 
const authentication = async (req, res, next) =>{
    try {
        let token = req.header('x-api-key')
        if(!Object.keys(req.headers).includes('x-api-key')) return res.status(400).json({status : false, message : "Your Header is missing"})
        if(!token){
            return res.status(400).json({status : false, message : "Token is missing"})
        }else{
            if(token){
                let decodedToken = jwt.verify(token, "secret-key")
                req.userId = decodedToken.userId
            }else{
                return res.status(401).json({status : false, message : "You Are Not Authenticated"})
            }
        }
        next()
    } catch (error) {
        return res.status(500).json({status : false, message : error.message})
    }
}


// For Authorization - 
const authorization = async (req, res, next) =>{
    try {
        let id = req.userId
        let userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).json({status : false, message : "Please Give Valid UserId"})
        if(userId){
            let user = await userModel.findById(userId)
            if(!user) return res.status(404).json({ status: false, message: "User Not Found" })
        }
        if(id != userId){
            return res.status(401).json({ status: false, message: "You Are Not Authorized" })
        }
        next()
    } catch (error) {
        return res.status(500).json({status : false, message : error.message})
    }
}



module.exports = {
    isValidObjectId,
    authentication,
    authorization
}