const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orders:{
      type:Array
    },
   
    
  });

  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order;