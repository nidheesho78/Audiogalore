const path = require("path");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");


///load product list

const loadProductList = async (req, res) => {
  try {
    const product = await Product.find({});
    res.render("productList", { product: product });
  } catch (error) {
    console.log(error.message);
  }
};

//load add product

const loadProducts = async (req, res) => {
  try {
    let categories = await Category.find({});

    res.render("addProduct", { category: categories });
  } catch (error) {
    console.log(error.message);
  }
};

///sunmit add product

const createProduct = async (req, res) => {
  try{
  const { name, description, category, price, stock } = req.body;
  const filesArray = Object.values(req.files).flat();
  const images = filesArray.map((file) => file.filename);
  let categories = await Category.find({});
  

  if (name.trim().length === 0 || description.trim().length === 0) {
    return res.render("addProduct", {
      message: "Product title and description cannot be empty",
      category: categories,
    });
  }

  // Validation for product price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.render("addProduct", {
      message: "Product price cannot be empty and should be a non-negative number",
      category: categories,
    });
  }

  // Validation for product stock
  const parsedStock = parseInt(stock);
  if (isNaN(parsedStock) || parsedStock <= 0) {
    return res.render("addProduct", {
      message: "Product stock cannot be empty and should be a non-negative integer",
      category: categories,
    });
  }

  // Check if a product with the same name already exists
  const existingProduct =await Product.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') }})
  if (existingProduct) {
    return res.render("addProduct", {
      message: "A product with the same name already exists",
      category: categories,
    });
  }

  const newProduct = new Product({
    name,
    description,
    images,
    category,
    price,
    stock,
  });

  
  newProduct
    .save()
    .then(() => {
      res.render("addProduct", {
        message: "Product added successfully",
        category: categories,
      });
    })
    .catch((err) => {
      console.error("Error adding product:", err);
      res.render("addProduct", {
        message: "Error in adding Product",
        category: categories,
      });
    });
}catch(error){
  console.log(error.message)
}
};


////editProductList

const editProductList = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.find({ _id: id });

    // Pass the stock value to the template
    const stock = productData[0].stock;

    const category = productData[0].category;
    const productCategory = await Category.find({ _id: category });
    const allCategory = await Category.find();

    res.render("editProductList", {
      productData,
      productCategory,
      allCategory,
      stock, // Include the stock value in the template context
    });
  } catch (error) {
    console.log(error.message);
  }
};

///update product list

const updateProductList = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const stock = req.body.stock; // Include the stock field
    const category = req.body.category;
    const status = req.body.status === "listed";
    const filesArray = Object.values(req.files).flat();
    const images = filesArray.map((file) => file.filename);

    // Find the existing product data
    const productData = await Product.findById(id);
    

    // Check if new images are provided
    const updatedImages = images.length > 0 ? images : productData.images;
    

    const update = await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          description: description,
          price: price,
          category: category,
          stock: stock, // Add the stock field
          is_listed: status,
          images: updatedImages
        },
      }
    );

    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error.message);
  }
};



//delete product

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const product = await Product.findByIdAndDelete(id);
    

    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};


///load product details

const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById(id);

    // Assuming your Product schema has a 'stock' property
    const stock = productData.stock;

    const categoryid = productData.category._id.toString();
    const categoryData = await Category.findById(categoryid);

    
    res.render('productDetails', { product: productData, categoryData, 
      user: res.locals.user, 
      stock 
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadProducts,
  createProduct,
  loadProductList,
  editProductList,
  updateProductList,
  deleteProduct,
  productDetails
};
