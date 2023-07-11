const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validId = require('../middlewares/auth')


// ----------------------------------------- Add To Cart ---------------------------------------------
const addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartId = req.body.cartId;
    const items = req.body.items;

    if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid User ID' })

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

    return res.status(201).json({ status: true, message: 'Added To Cart', products: cart });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};



// -------------------------------------- Update Cart --------------------------------------
const cartUpdate = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid User ID' })

    const findUser = await userModel.findById(userId);
    if (!findUser) return res.status(404).json({ status: false, message: 'User Not Found' });

    const findProduct = await productModel.findById(data.productId);
    if (!findProduct || findProduct.isDeleted) return res.status(404).json({ status: false, message: 'Product Not Found' });

    const cart = await cartModel.findOne({ _id: data.cartId });
    if (!cart) return res.status(404).json({ status: false, message: 'Cart Not Found' });

    if (data.removeProduct === 1) {  // ( At a time only one item can be remove )
      // Decrement the quantity of the product by 1
      const item = cart.items.find(item => item.productId.toString() === data.productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;

          // Decrement the price of the product by 1
          const product = await productModel.findById(data.productId);
          if (product) {
            item.price -= 1;
            cart.totalPrice -= product.price;
            cart.totalItems -= 1;
          }
        } else {
          // Remove the product from the cart if its quantity becomes zero
          const updatedItems = cart.items.filter(item => item.productId.toString() !== data.productId);
          cart.items = updatedItems;
          cart.totalItems -= 1;

          // Decrement the price of the product by 1
          const product = await productModel.findById(data.productId);
          if (product) {
            cart.totalPrice -= product.price;
          }
        }
      }
    } else {
      return res.status(400).json({ status: false, message: 'Invalid value' });
    }
    // Save the updated cart
    await cart.save();

    return res.status(200).json({ status: true, message: 'Cart updated', data: cart });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};




// ------------------------------------------- Get Cart -----------------------------------------------
let getCart = async (req, res) => {
  try {
    let userId = req.params.userId
    if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid User ID' })

    let cart = await cartModel.findOne({ userId })
    if (!cart) return res.status(404).json({ status: false, message: 'Cart Not Found' })

    let data = await cartModel.findOne({ userId }).select({
      cartId: 1,
      userId: 1,
      // items: 1,
      items: cart.items.map((item) => ({
        _id: 0,
        productId: item.productId,
        quantity: item.quantity,
      })),
      totalPrice: 1,
      totalItems: 1,
      createdAt: 1,
      updatedAt: 1
    })

    return res.status(200).json({ status: true, message: 'Details', data: data })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}




// ----------------------------------------- Delete Cart -------------------------------------- 
const deleteCart = async (req, res) => {
  try {
    let userId = req.params.userId
    if (!validId.isValidObjectId(userId)) return res.status(400).json({ status: false, message: 'Please Give Valid User ID' })

    let cart = await cartModel.findOne({ userId })
    if (!cart) return res.status(404).json({ status: false, message: 'Cart Not Found' })

    cart.items = []
    cart.totalItems = 0
    cart.totalPrice = 0

    await cart.save()

    return res.status(200).json({ status: true, message: 'Deleted' })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}


module.exports = {
  addToCart,
  cartUpdate,
  getCart,
  deleteCart
}