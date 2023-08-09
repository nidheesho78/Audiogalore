const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    required:true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price:{
    type:Number,
    required:true
  },
  is_listed:{

    type:Boolean,
    default:true

  },
  stock:{
    type:Number,
    
  },
  
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
