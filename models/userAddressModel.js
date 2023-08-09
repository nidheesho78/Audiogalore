const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.String,
    ref: "User",
    required: true,
  },
  addresses: [
    {
      name: {
        type: String,
        required: true,
      },
      mobileNumber: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      locality: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Address", userAddressSchema);
