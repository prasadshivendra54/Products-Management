const express = require('express')
const router = express.Router()


// ------------------------------------------------ Middlewares ---------------------------------------------------- 
const { authentication, authorization } = require('../middlewares/auth')



// ----------------------------------------------- User Controllers ------------------------------------------------
const { userRegister, userLogin, getUser, updateUser } = require('../controllers/userController')



// ----------------------------------------------- Product Controllers --------------------------------------------- 
const { addProduct, getProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productController')



// ----------------------------------------------- Cart controller --------------------------------------------------- 
const { addToCart, cartUpdate, getCart, deleteCart } = require('../controllers/cartController')



// ----------------------------------------------- Order Controller ---------------------------------------------------
const { createOrder, updateOrder } = require('../controllers/orderController')



// ----------------------------------------------- User API's - 90% Done ! -----------------------------------------------
router.post('/register', userRegister) // 95% Done ! (Pending => Validation Part want to be seprate file & Profile Image Validation)
router.post('/login', userLogin) // 99% Done !
router.get('/user/:userId/profile', authentication, getUser) // 99% Done !
router.put('/user/:userId/profile', authentication, authorization, updateUser) // 90% Done (Pending => All Update's Validation Is Pending)




// ----------------------------------------------- Products API's - 90% Done ! --------------------------------------------
router.post('/products', addProduct) // 95% Done ! (Pending => Validation Part want to be seprate file & Product Image Validation)
router.get('/products', getProduct) // 99% Done !
router.get('/products/:productId', getProductById) // 99% Done !
router.put('/products/:productId', updateProduct) // 90% Done (Pending => All Update's Validation Is Pending)
router.delete('/products/:productId', deleteProduct) // 99% Done !




// ----------------------------------------------- Cart API's - 99% Done ! --------------------------------------------------
router.post('/users/:userId/cart', authentication, authorization, addToCart) // 99% Done !
router.put('/users/:userId/cart', authentication, authorization, cartUpdate) // 99% Done !
router.get('/users/:userId/cart', authentication, authorization, getCart) // 99% Done !
router.delete('/users/:userId/cart', authentication, authorization, deleteCart) // 99% Done !




// ----------------------------------------------- Order API's - 95% Done ! ----------------------------------------------------
router.post('/users/:userId/orders', authentication, authorization, createOrder) // 90% Done !
router.put('/users/:userId/orders', authentication, authorization, updateOrder) // 99% Done !



module.exports = router