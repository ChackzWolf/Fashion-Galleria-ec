const ProductModel = require("../models/Product");
const path = require("path");
const { upload } = require('../utils/imageHandler');
const fs = require('fs');
const Swal = require('sweetalert2');
const CategoryModel = require("../models/Category");
const fileHandler = require("../utils/files")


const  addProduct = async (req,res) =>{


  console.log('started adding product')
    const {name,price,description,stockLarge,stockMedium,stockSmall} = req.body;
    console.log(name,price,description,stockLarge,stockMedium,stockSmall)
    const category = await CategoryModel.find()
    if(name == '' || price<1 || description == ''){
      console.log('was empty')
      let notFilled = true
      res.render("admin/add-product",{notFilled,category})
    }else{
      const categoryId = req.body.category;
      console.log(categoryId,'categoryId')
  
  
      const sizeStock = {
        sizeLarge: {
          large: "Large",
          stock: parseInt(stockLarge) || 0
        },
        sizeMedium: {
          medium: "Medium",
          stock: parseInt(stockMedium) || 0
        },
        sizeSmall: {
          small: "Small",
          stock: parseInt(stockSmall) || 0
        }
      }

          
              const categoryConnect = await CategoryModel.findOne({name:req.body.category})
          
              console.log(req.files, 'req.files') ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

              const images = req.files
                                  .filter((file) =>
                                        file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp" || file.mimetype === 'image/avif')
                                  .map((file) => file.filename);   
              console.log(images, 'req.files images')
              if(images.length ===3){
                  const data = {
                    name,
                    price,
                    description,
                    category:categoryId,
                    sizeStock:sizeStock,
                    imageUrl:images,
                    listStatus:true,
                    deleteStatus:false,
                  }

                  console.log(data);
                  let product = await ProductModel.create(data);
                
                  if(product){
                    let success = true                           
                    console.log(product)                                                      

                    res.render("admin/add-product",{success,category});
                    
                  }else{
                    let unsuccess = true
                    res.render("admin/add-product",{unsuccess,category});
                  }
          }else{
              const wrongEntry = true;
              res.render("admin/add-product",{wrongEntry,category})
          }
      
    }
  
}                           
  
  




const listUnlistProduct = async(req,res)=>{

  const pageNum =  req.query.page;
  const perPage = 6 ;
  let docCount
  let pages
  const documents = await ProductModel.countDocuments({deleteStatus:false})


  const product = await ProductModel.findById({_id:req.params.id})                   
  if(product){
  
    const update = await ProductModel.updateOne({_id:product.id}, {$set: {listStatus:!product.listStatus}})
    if(update){
    
      const products = await ProductModel.find({deleteStatus:false}).skip((pageNum - 1) * perPage).limit(perPage); 
      docCount = documents
      pages = Math.ceil(docCount / perPage)
    
      let countPages = []
      for (let i = 0; i < pages; i++) {
    
          countPages[i] = i + 1
      }
      res.render("admin/edit-product",{products,countPages});
    }else{
      console('not updated.')
      res.render("admin/edit-product")
    }
  }
}


const editedProductDetails = async (req,res)=>{
    const {id, name, price , description, stockLarge, stockMedium, stockSmall, categoryId } = req.body;
    console.log(req.files,'req.files edit product')

    const sizeStock = {
        sizeLarge:{
          stock: stockLarge
        },
        sizeMedium: {
          stock: stockMedium
        },
        sizeSmall:{
          stock: stockSmall
        }
    }
  
  
    const images = req.files
                          .filter((file) =>
                                file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp" || file.mimetype === 'image/avif')
                          .map((file) => file.filename);   

    const existingProduct = await ProductModel.findById(id);
    if(!existingProduct){
        return res.status(404).send("Product not found.");
    }

    

  let c = 0
  for(let i = 0; i<3 ; i++){
    if(images[i] == undefined){
        images[i] = existingProduct.imageUrl[i];
        console.log(images[i],'*');
    }
  }


  console.log(images)

  if(!req.file||req.files.length === 0){
      console.log('!req.file   length ====0 ')
      const updateData = {
        name: name,
        price: price,
        description: description,
        sizeStock: sizeStock,
        category: categoryId,
        imageUrl:images
      };
      console.log(updateData,'update data')

    const update = await ProductModel.updateOne({_id:id},{$set: updateData})
    console.log(update,'updated')
    if(update){
      console.log('updated')
      let success = true
      res.redirect(`/admin/edit-product?success=${success}`)
      console.log(success)
    }else{
      console.log("update nadannila....")
      res.render("admin/edit-product");
    }
  }
}

const editProductDetailsView = async(req,res)=>{
    const editProduct = await ProductModel.findOne({_id:req.query.id});
    const category = await CategoryModel.find();
    res.render("admin/edit-product-details",{editProduct,category});
}

 

const deleteProduct = async(req,res)=>{

  const productID = req.params.id
  const product = await ProductModel.findById({_id:productID})
  const category = await CategoryModel.find({deleteStatus:false});
  if(!product){
    return res.status(404).json({message: "product not found."})
  }else{
    

    // Delete each image associated with the product
    for (const imageUrl of product.imageUrl) {
        fileHandler.deleteFile(imageUrl);
    }

    await ProductModel.updateOne({_id:productID}, {$set:{deleteStatus: true}})
    msgDelete = true
    res.redirect("/admin/edit-product")
  }

}


const deleteFile = (filePath) => {
  // Construct the absolute path to the file
  const absoluteFilePath = path.join(__dirname,"..","public","uploaded-images",filePath);

  // Delete the file
  fs.unlink(absoluteFilePath, (err) => {
      if (err) {
        console.log("error deleting file");

      } else {
          console.log("File deleted successfully:", absoluteFilePath);
      }
  });
};


const addCategory = async(req,res)=>{ 
  console.log(req.body,"dddddddddddddddddddddd") 
  const categoryName = req.body.name; 
  console.log(categoryName); 
  const categoryData = { 
    name:categoryName, 
    listStatus:true 
  }
    if(categoryName !== ''){
        const categoryExist  = await CategoryModel.findOne({name:categoryName});
        if(categoryExist){
            console.log('category exists')
            res.redirect(`/admin/add-category?exists=${exists}`)
            console.log("category already exists.")
        }else{
                
            console.log("category deos'nt exists");
            const category = await CategoryModel.create(categoryData)
            console.log(category)
            if(category){
                let success = true
                console.log("success");
                res.redirect(`/admin/add-product?success=${success}`);
            }           
        }         
    }
    else{
        const fieldEmpty = true;
        console.log("field was empty");
        res.render("admin/add-category",{fieldEmpty});
    }    
}



module.exports = {
    addProduct,
    listUnlistProduct,
    editProductDetailsView,
    editedProductDetails,
    deleteProduct,
    addCategory,

}
