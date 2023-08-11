const Category = require("../models/categoryModel");

//load category

const loadCategory = async (req, res) => {
  try {
    const categories = await Category.find();

    res.render("page-categories", { categories });
  } catch (error) {
    console.log(error);
  }
};

//Create/add  category

const createCategory = async (req, res) => {
  try {
    const name = req.body.name.trim();
    const description = req.body.description.trim();
 
    if (description === "") {
      // Description is empty
      const categories = await Category.find();
      return res.render("page-categories", { message: "Description cannot be empty", categories });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingCategory) {
      const categories = await Category.find();
      return res.render("page-categories", { message: "Name already exists", categories });
    } else {
      const category = new Category({
        name: name,
        description: description,
      });
      const savedCategory = await category.save();
      res.redirect("/admin/loadCategory");
      console.log(savedCategory);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const showCategory = async (req, res) => {
  try {
    res.redirect("/admin/loadCategory");
  } catch (error) {
    console.log(error.message);
  }
};


 const loadUpdateCategory = async (req, res) => {
  try {
    const id = req.query.id;

    const Categorydata = await Category.findById({ _id: id });
    console.log(Categorydata);

    res.render("editCategories", { category: Categorydata });
  } catch (error) {
    console.log(error.message);
  }
};

// Update a category
async function updateCategory(req, res) {
  try {
    const categoryId = req.body.id;
    const newName = req.body.category.trim();
    const newDescription = req.body.description.trim();

    if (newDescription === "") {
      // Description is empty
      // Redirect to the editCategories page and display an error message
      return res.render("editCategories", { message: "Description cannot be empty", category: { _id: categoryId, name: newName, description: newDescription } });
    }

    // Check if the updated category name already exists (excluding the current category being updated)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${newName}$`, 'i') },
      _id: { $ne: categoryId } // Exclude the current category being updated from the search
    });

    if (existingCategory) {
      // Category name already exists (case-insensitive)
      // Redirect to the editCategories page and display an error message
      return res.render("editCategories", { message: "Category name already exists", category: existingCategory });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: categoryId },
      { $set: { name: newName, description: newDescription } }
    );
    
    res.redirect("/admin/loadCategory");
  } catch (error) {
    console.log(error.message);
    res.render("editCategories", { message: 'Failed to update category' });
  }
}



//delete category

const deleteCategory = async (req, res) =>{

  try {
    const categoryId = req.query.id;
    console.log(categoryId);
    const updatedCategory = await Category.findByIdAndDelete(categoryId)
    res.redirect('/admin/loadCategory')
  } catch (error) {
    console.log(error.message)
    
    res.render("editCategories",{message:'Failed to update category'})
  }
}


//change status

const changeStatus = async (req, res) => {
  try {

    const category_id = req.query.id;
const category = await Category.findById(category_id);

if (category) {
  const updatedList = !category.isListed; // Toggle the value
  const result=await Category.updateOne({_id:category.id},{$set:{isListed:updatedList}})
  await category.save();
}

    res.redirect("/admin/loadCategory");
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loadCategory,
  createCategory,
  loadUpdateCategory,
  updateCategory,
  changeStatus,
  showCategory,
  deleteCategory
  
  
 
};
