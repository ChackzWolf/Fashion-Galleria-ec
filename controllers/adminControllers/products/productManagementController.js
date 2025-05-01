const CategoryModel = require('../../../models/Category');
const ProductModel = require('../../../models/Product');



const addProductView = async(req,res)=>{
    try{
        const category = await CategoryModel.find({deleteStatus:false})
        res.render("admin/add-product",{category})
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const editProductView = async(req,res) =>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages

        const products = await ProductModel.find({deleteStatus:false}).populate('category').skip((pageNum - 1) * perPage).limit(perPage)
        const category = await CategoryModel.find({deleteStatus:false})
        const documents = await ProductModel.countDocuments({deleteStatus:false});


        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }

        res.render("admin/edit-product",{products,category,countPages});
    }catch(error){
        res.status(500).render("user/error-handling");
    }

}




const deletedProductsView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 8
        let docCount
        let pages

        const deletedProducts = await ProductModel.find({deletedProducts:true}).skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await ProductModel.countDocuments({deletedProducts:true});
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }

        res.render("admin/deleted-products",{deletedProducts,countPages});
    }catch(err){
        res.status(500).render("user/error-handling")
    }    
}





module.exports = {
    addProductView,
    editProductView,
    deletedProductsView,
}  