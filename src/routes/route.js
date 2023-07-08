const express = require('express')
const router = express.Router()

// Middleware - 
const {authentication, authorization} = require('../middlewares/auth')

// User Controllers - 
const {userRegister, userLogin, getUser, updateUser} = require('../controllers/userController')

// Product Controllers - 
const {addProduct, getProduct, getProductById, updateProduct, deleteProduct} = require('../controllers/productController')

// Cart controller - 
const {addToCart, updateCart} = require('../controllers/cartController')

// User API's - 90% Done !
router.post('/register', userRegister) // 95% Done ! (Pending => Validation Part want to be seprate file & Profile Image Validation)
router.post('/login', userLogin) // 100% Done !
router.get('/user/:userId/profile', authentication, getUser) // 100% Done !
router.put('/user/:userId/profile', authentication, authorization, updateUser) // 90% Done (Pending => All Update's Validation Is Pending)


// Products API's - 90% Done !
router.post('/products', addProduct) // 95% Done ! (Pending => Validation Part want to be seprate file & Product Image Validation)
router.get('/products', getProduct) // 100% Done !
router.get('/products/:productId', getProductById) // 100% Done !
router.put('/products/:productId', updateProduct) // 90% Done (Pending => All Update's Validation Is Pending)
router.delete('/products/:productId', deleteProduct) // 100% Done !


// Cart API's - 
router.post('/users/:userId/cart', authentication, authorization, addToCart) // 95% Done !
router.put('/users/:userId/cart', authentication, authorization, updateCart)
router.get('/users/:userId/cart')
router.delete('/users/:userId/cart')


// Order API's - 
router.post('/users/:userId/orders')
router.put('/users/:userId/orders')





module.exports = router