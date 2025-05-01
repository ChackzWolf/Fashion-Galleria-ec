 const CategoryModel = require('../../../models/Category')

const categoryListView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages
        const categories = await CategoryModel.find({deleteStatus:false}).skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await CategoryModel.countDocuments({deletedProducts:true});
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }

        res.render("admin/category-list",{categories,countPages});
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}



const addCategory = async(req,res)=>{
    try{

        const category = await CategoryModel.find().skip((pageNum - 1) * perPage).limit(perPage);


        res.render("admin/add-category",{category});
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const editCategoryView = async(req,res)=>{
    try{
        console.log(req.query.id,'iddd');
        const editCategory = await CategoryModel.findOne({_id:req.query.id});
        console.log(editCategory);
        res.render("admin/edit-category-details",{editCategory})
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const editCategory = async(req,res)=>{
    try{
        const {id,name,offer} = req.body;
        let offerNum = parseFloat(offer);
        console.log('id',id ,'name',name ,'offer ',offer)
        const updateData = {
            name:name,
            listStatus:true,
            offer:offerNum
        }
        const update = await CategoryModel.updateOne({_id:id},{$set:{name:name,offer:offerNum}});
        console.log(update,'update');
        if(offerNum >0){
          const productsUpdate = await ProductModel.updateMany(
              { category: id },
              [
                 {
                   $set: {
                     offerPrice: {
                       $toInt: {
                         $subtract: ["$price", { $multiply: ["$price", { $divide: [offerNum,  100] }] }]
                       }
                     }
                   }
                 }                            
              ]
            );
        }else{
              console.log('was 0')
              const backtoback = await ProductModel.updateMany({category:id},{$set:{offerPrice:0}});
              console.log(backtoback,'000')
        } 
          if(update){
              console.log('updated')
              let success = true
              res.redirect(`/admin/category-list?success=${success}`)
          }
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}   




const listUnlistCategory = async (req,res)=>{
    try{
        const categoryId = req.params.id;
        const category = await CategoryModel.findById({_id:categoryId});
        console.log(category.listStatus)
        if(category.listStatus){
    
            const updateCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{listStatus:false}});
            const updateProducts = await ProductModel.updateMany({category:categoryId},{$set:{listStatus:false}})
            console.log('false')
        }else{
            const updateCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{listStatus:true}});
            const updateProducts = await ProductModel.updateMany({category:categoryId},{$set:{listStatus:true}})
            console.log('true')
        }
        const categories = await CategoryModel.find({deleteStatus:false})
        res.render("admin/category-list",{categories})
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const deleteCategory = async (req,res)=>{
    try{
        const categoryId = req.params.id;
        const deleteCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{deleteStatus:true}});
        if(deleteCategory){
            const deleteProducts = await ProductModel.updateMany({category:categoryId},{$set:{deleteStatus:true}});
            if(deleteProducts){
                const deleted = true
                const categories = await CategoryModel.find({deleteStatus:false});
                res.render("admin/category-list",{categories,deleted});
            }
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}






module.exports = {
    addCategory,
    categoryListView,
    addCategory,
    editCategoryView,
    editCategory,
    listUnlistCategory,
    deleteCategory,
}  