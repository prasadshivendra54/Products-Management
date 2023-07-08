const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true,
        // valid : true // number/decimal
    },
    currencyId : {
        type : String,
        required : true,
        enum : ["INR"],
        default : "INR"
    },
    currencyFormat : {
        type : String,
        required : true,
        // Rupee symbol
    },
    isFreeShipping : {
        type : Boolean,
        default : false
    },
    productImage : { // S3 Link
        type : String,
        required : true
    },
    style : {
        type : String
    },
    availableSizes : { // array of string, at least one size
        type : [{
            type : String,
            enum : ["S", "XS","M","X", "L","XXL", "XL"]
        }],
        required : true
    },
    installments : {
        type : Number
    },
    deletedAt : { // when the document is deleted
        type : Date,
        default : null
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})



// productSchema.virtual('formattedCurrency').get(function() {
//     return `₹${this.price.toFixed(2)}`;
// });


// // Define the virtual property 'currencyFormat'
// productSchema.virtual('currencyFormat').get(function() {
//     return '₹' + this.price; // Assuming 'price' is the field representing the price value
// });

module.exports = mongoose.model('Product', productSchema)