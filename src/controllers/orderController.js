const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const orderModel = require('../models/orderModel')
const validId = require('../middlewares/auth')


// --------------------------------------------------- Create Order ------------------------------------------------------
const createOrder = async (req, res) => {
    try {
        let userId = req.params.userId
        let orderData = req.body

        if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid UserId' })

        if (!orderData.userId) return res.status(400).json({ status: false, message: 'UserId Is Required' })

        for (const item of orderData.items) {
            const { productId, quantity } = item;

            const product = await productModel.findById(productId);
            if (!product || product.isDeleted) return res.status(404).json({ status: false, message: 'Product Not Found' });

            if (!quantity || quantity == 0) return res.status(400).json({ status: false, message: 'Please Quantity' })
        }

        if (!orderData.totalPrice) return res.status(400).json({ status: false, message: 'Please Enter Product Price, Required' })

        if (!orderData.totalItems) return res.status(400).json({ status: false, message: 'Please Confirm Total Items, Required' })

        if (!orderData.totalQuantity) return res.status(400).json({ status: false, message: 'Please Confirm Quantity of Items, Required' })

        let data = await orderModel.create(orderData)
        let resData = await orderModel.findOne(data).select({
            _id: 1,
            userId: 1,
            // items: 1,
            items: orderData.items.map((item) => ({
                _id: 0,
                productId: item.productId,
                quantity: item.quantity,
            })),
            totalPrice: 1,
            totalItems: 1,
            totalQuantity: 1,
            cancellable: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
        })
        return res.status(201).json({ status: true, message: 'Order Confirm', data: resData })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}

// -------------------------------------------------------------------------------------------------------------------------------
// const createOrder = async function (req, res) { // Not Working*****
//     try {
//         const userId = req.params.userId;
//         const data = req.body;
//         const { items, cancellable, status } = data
//         // if (!userId || !items) {
//         //     return res.status(400).send({ status: false, message: "Please enter the required values." });
//         // }
//         if (!validId.isValidObjectId(userId)) {
//             return res.status(400).send({ status: false, message: "Please enter a valid userId." });
//         }
//         // because items in the body is kind of array so after iterating we can get the productId , after getting it , i am checking validation for it
//         for (let product of items) {
//             if (!validId.isValidObjectId(product.productId)) {
//                 return res.status(400).send({ status: false, message: "Please enter a valid productId." });
//             }
//         }
//         // checking user like it exist or not
//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).send({ status: false, message: "User not found." });
//         }
//         // creating array of productId after seperating from array(items)
//         const productIds = items.map((item) => item.productId);
//         // checking that product exist or not
//         const products = await productModel.find({
//             _id: { $in: productIds },
//             isDeleted: false,
//         });

//         if (products.length !== productIds.length) {
//             return res
//                 .status(404)
//                 .send({
//                     status: false,
//                     message: "Invalid product(s) or product(s) not found.",
//                 });
//         }
//         const order = await orderModel.findOne({ userId: userId, cancellable: true })
//         if (!order) {
//             order = await orderModel.create({
//                 userId: userId,
//                 items: [],
//                 totalPrice: 0,
//                 totalItems: 0,
//                 totalQuantity: 0,
//                 status: status
//             });
//         }
//         if (cancellable != undefined) {
//             order.cancellable = cancellable
//         }
//         for (const item of items) {
//             let existingItem = order.items.find(
//                 (existingItem) =>
//                     existingItem.productId.toString() === item.productId.toString()
//             );
//             if (existingItem) {
//                 // If the product already exists in the order, update the quantity
//                 existingItem.quantity += item.quantity;
//             } else {
//                 // If the product doesn't exist in the order, add it as a new item
//                 order.items.push({
//                     productId: item.productId,
//                     quantity: item.quantity,
//                 });
//             }
//             // Update totalItems
//             order.totalItems = order.items.length;
//         }
//         let totalQuantity = 0;
//         for (let count of order.items) {
//             totalQuantity += count.quantity

//         }
//         order.totalQuantity = totalQuantity
//         // Calculate the total price of the order based on the product prices
//         order.totalPrice = TotalPrice(order.items, products);

//         // Save the updated order
//         await order.save();

//         // Return the updated order document with product details
//         const response = {
//             _id: order._id,
//             userId: order.userId,
//             items: order.items.map((item) => ({
//                 productId: item.productId,
//                 quantity: item.quantity,
//             })),
//             totalPrice: order.totalPrice,
//             totalItems: order.totalItems,
//             totalQuantity: order.totalQuantity,
//             cancellable: order.cancellable,
//             status: order.status,
//             createdAt: order.createdAt,
//             updatedAt: order.updatedAt,
//         };
//         return res.status(201).send({ status: true, message: "successful", data: response });
//     } catch (error) {
//         if (error.message.includes("validation")) {
//             return res.status(400).send({ status: false, message: error.message });
//         } else if (error.message.includes("duplicate")) {
//             return res.status(400).send({ status: false, message: error.message });
//         } else {
//             return res.status(500).send({ status: false, message: error.message });
//         }
//     }
// };
// -------------------------------------------------------------------------------------------------------------------------------




// ---------------------------------------------- Update Order --------------------------------------------
const updateOrder = async (req, res) => {
    try {
        let userId = req.params.userId
        let orderData = req.body

        if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid UserId' })

        let user = await userModel.findById(userId)
        if (!user) return res.status(400).json({ status: false, message: 'User Not Found' })

        if (!validId.isValidObjectId(orderData.orderId)) return res.status(400).json({ status: false, message: 'Please Give Valid OrderId' })
        let order = await orderModel.findById(orderData.orderId)
        if (!order) return res.status(400).json({ status: false, message: 'Order Not Found' })
        if (order.cancellable !== true) return res.status(400).json({ status: false, message: 'Order Can Not Be Can Cancel' })

        if (orderData.status == 'cancled') {
            order.status = 'cancled'
            order.cancellable = false;
        } else if (orderData.status == 'pending') {
            order.status = 'pending'
            order.cancellable = true
        } else if (orderData.status == 'completed') {
            order.status = 'completed'
            order.cancellable = true
        } else {
            return res.status(400).json({ status: false, message: 'Invalid Status' })
        }

        let data = await order.save()

        let responseData = await orderModel.findById(data).select({
            _id: 1,
            userId: 1,
            items: 1,
            // items: orderData.items.map((item) => ({ // map() not working**
            //     _id: 0,
            //     productId: item.productId,
            //     quantity: item.quantity,
            // })),
            totalPrice: 1,
            totalItems: 1,
            totalQuantity: 1,
            cancellable: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
        })

        return res.status(200).json({ status: true, message: 'Updated', data: responseData })
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}


module.exports = {
    createOrder,
    updateOrder
}