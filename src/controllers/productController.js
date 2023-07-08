const { default: mongoose, now } = require("mongoose");
const productModel = require('../models/productModel');
const validId = require('../middlewares/auth')
const { uploadFile } = require('../aws/aws')


// To Add Products - 
const addProduct = async (req, res) => {
    try {
        let files = req.files
        let productData = req.body
        if (!productData.title && !productData.description && !productData.price && !productData.currencyId && !productData.currencyFormat && !productData.isFreeShipping && !productData.productImage && !productData.style && !productData.availableSizes && !productData.installments && !productData.deletedAt && !productData.isDeleted) return res.status(400).json({ status: false, message: "Please Fill All Details..(REQUIRED*)" })

        if (!productData.title) return res.status(400).json({ status: false, message: "Please Enter Title (REQUIRED*)" })
        let title = await productModel.find({ title: productData.title })
        if (title.length > 0) return res.status(400).json({ status: false, message: `Title ${productData.title} Already Exist (Please Enter Another Title)` })

        if (!productData.description) return res.status(400).json({ status: false, message: "Please Enter Description (REQUIRED*)" })

        if (!productData.price) return res.status(400).json({ status: false, message: "Please Enter Price (REQUIRED*)" })
        let priceFormat = /^\d+(\.\d{1,2})?$/
        if (!priceFormat.test(productData.price) && isNaN(productData.price) && productData.price <= 0) return res.status(400).json({ status: false, message: "Please Enter Valid Price" })

        if (!productData.currencyId) return res.status(400).json({ status: false, message: "Please Enter CurrencyId (REQUIRED*)" })
        if(productData.currencyId != "INR") return res.status(400).json({ status: false, message: `CurrencyId Should Be INR` })

        if (!productData.currencyFormat) return res.status(400).json({ status: false, message: "Please Enter Currency in ₹ Format (REQUIRED*)" })
        let currencyFormat = /₹/
        if (!currencyFormat.test(productData.currencyFormat)) return res.status(400).json({ status: false, message: `CurrencyFormat Should Be Rupee symbol like:- ${'₹'} ` })


        let productImage = await uploadFile(files[0])
        productData.productImage = productImage


        if (!productData.availableSizes) return res.status(400).json({ status: false, message: "Please Add AvailableSizes Of Product (REQUIRED*)" })
        if (!productData.availableSizes.length >= 1) return res.status(400).json({ status: false, message: "At least one size must be provided." })
        let validSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        let invalidSizes = productData.availableSizes.filter(size => !validSizes.includes(size));
        if (invalidSizes.length > 0) return res.status(400).json({ status: false, message: `Invalid sizes provided: ${invalidSizes}` })

        let data = await productModel.create(productData)
        return res.status(201).json({ status: true, message: "Product Added successfully", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}



const getProduct = async (req, res) => {
    try {
        let productData = req.body
        let product = ({ isDeleted: false })
        let data = await productModel.find(product)
        if (data.length > 0) return res.status(200).json({ status: true, message: "All Products", data: data })
        return res.status(404).json({ status: false, message: "Products Not Found" })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}



const getProductById = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!validId.isValidObjectId(productId)) return res.status(400).json({ status: false, message: "Please Give Valid ProductId" })
        let data = await productModel.findOne({ _id: productId }).lean()
        if (!data) return res.status(404).json({ status: false, message: "Product Not Found" })
        return res.status(200).json({ status: true, message: "Product Detail", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}



const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!validId.isValidObjectId(productId)) return res.status(400).json({ status: false, message: "Please give valid ProductId" })
        let productData = req.body
        let findProductId = await productModel.findById(productId)
        if (!findProductId) return res.status(404).json({ status: false, message: "Product Not Found" })
        let data = await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: productData },
            { new: true }
        )
        return res.status(200).json({ status: true, message: "Product Updated", data: data })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}


const deleteProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!validId.isValidObjectId(productId)) return res.status(400).json({ status: false, message: "Please give valid ProductId" })
        let findProductId = await productModel.findById(productId)
        if (!findProductId || findProductId.isDeleted == true) return res.status(404).json({ status: false, message: "Product Not Found" })
        let data = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date } },
            { new: true }
        )
        return res.status(200).json({ status: true, message: "Product Deleted" })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = {
    addProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct
}