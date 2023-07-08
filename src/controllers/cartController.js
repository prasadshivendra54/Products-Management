const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validId = require('../middlewares/auth')


// Add To Cart -
const addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartId = req.body.cartId;
    const items = req.body.items;


    if (cartId) {
      let cart = await cartModel.findById(cartId);
      if (!cart) {
        return res.status(404).json({ status: false, message: 'Cart not found' });
      }
    } else {
      // Create a new cart if it does not exist for the user
      cart = await cartModel.findOne({ userId });
      if (!cart) {
        cart = await cartModel.create({ userId, items: [], totalPrice: 0, totalItems: 0 });
      }
    }


    // Make sure the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Add the products to the cart
    for (const item of items) {
      const { productId, quantity } = item;

      // Make sure the product exists and is not deleted
      const product = await productModel.findById(productId);
      if (!product || product.isDeleted) {
        return res.status(404).json({ status: false, message: 'Product not found or deleted' });
      }

      // Add the product to the cart
      cart.items.push({ productId, quantity });
      cart.totalItems += quantity;
      cart.totalPrice += product.price * quantity;
    }

    await cart.save();

    return res.status(201).json({ status: true, message: "Added To Cart", products: cart });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};



// Update Cart -
// const cartUpdate = async (req, res) =>{
//   try {
//     let userId = req.params.userId
//     let cartId = req.body.cartId
//     let productId = req.body.productId
//     let removeProduct = req.body.removeProduct
    

//   } catch (error) {
    
//   }
// }




const updateCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartId = req.body.cartId;
    const productId = req.body.productId;
    const removeProduct = req.body.removeProduct;

    // Ensure the cart exists
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    // Ensure the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Check if the product exists and is not deleted
    const product = await productModel.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ status: false, message: 'Product not found or deleted' });
    }

    // Find the item in the cart
    const item = cart.items.find(item => item.productId === productId);
    if (!item) {
      return res.status(404).json({ status: false, message: 'Product not found in cart' });
    }

    // Remove the product from the cart or decrement its quantity
    if (removeProduct) {
      // Remove the product from the cart
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      // Decrement the product's quantity
      item.quantity -= 1;
      if (item.quantity <= 0) {
        // Remove the product from the cart if quantity becomes zero
        cart.items = cart.items.filter(item => item.productId !== productId);
      }
    }

    // Update the totalItems and totalPrice of the cart
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => {
      const product = productModel.find(product => product._id.toString() === item.productId.toString());
      return total + (product ? product.price * item.quantity : 0);
    }, 0);

    await cart.save();

    // Get updated product(s) details in the response body
    const updatedProducts = await productModel.find({ _id: { $in: cart.items.map(item => item.productId) } });

    return res.status(200).json({ status: true, message: 'Cart updated successfully', products: updatedProducts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


module.exports = {
  addToCart,
  updateCart
}





