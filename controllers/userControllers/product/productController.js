const ProductModel = require("../../../models/Product");
const CategoryModel = require("../../../models/Category");

const productList= (req,res) =>{
    try{
        res.render("user/product-list")

    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}


const productDetailsView = async (req,res) => {
    try{
        const products = await ProductModel.aggregate([{$match:{listStatus:true,deleteStatus:false}}]).limit(4);
        const singleProduct = await ProductModel.findOne({_id:req.query.id});

        let cartCount = 0;
        if(req.session.user !== undefined ) cartCount = await userFunc.getCartCount(req.session.user._id);
        return res.render("user/product-details",{singleProduct,products,cartCount});
    }catch(error){
        console.log(error, "productDetailsView error")
        res.status(500).json({ status: false, error: "Something went wrong on the server." }); 
    }
};


const shopView = async (req,res) => {
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages
    
        let strMin = req.query.minamount;
        let strMax = req.query.maxamount;
        let minAmount=1000;
        let maxAmount=2000;
        if(typeof strMin === 'string' && typeof strMax === 'string'){
            // Split the string into an array of characters
            const charArrayMin = strMin.split('');
            const charArrayMax = strMax.split('');
            // Filter out non-numeric characters
            const numericArrayMin = charArrayMin.filter(char => !isNaN(char));
            const numericArrayMax = charArrayMax.filter(char => !isNaN(char));
            // Join the filtered characters back into a string
            const minAmountStr = numericArrayMin.join('');
            const maxAmountStr = numericArrayMax.join('');
            // Convert the cleaned string to a number
            minAmount = Number(minAmountStr);
            maxAmount = Number(maxAmountStr);
        }

        if(req.query.category || minAmount && maxAmount){
            const category = req.query.category;
            console.log('reached',maxAmount,category)
            if(category){
                const products = await ProductModel.find({$and:[{category:category},{ price: { $gt: minAmount, $lt: maxAmount }},{listStatus: true}, {deleteStatus: false}]}).skip((pageNum - 1) * perPage).limit(perPage);
                const documents = await ProductModel.countDocuments({$and:[{category:category},{ price: { $gt: minAmount, $lt: maxAmount }},{listStatus: true}, {deleteStatus: false}]})
            
                console.log('products',products);
                console.log('documets',documents)

                docCount = documents
                pages = Math.ceil(docCount / perPage)
            
                let countPages = []
                for (let i = 0; i < pages; i++) {
                
                    countPages[i] = i + 1
                }

                console.log('category',category)
                docCount= documents
                const categoryName = await CategoryModel.find({deleteStatus:false,listStatus:true});
                res.render("user/shop", { products,categoryName,category,minAmount,maxAmount,countPages})
            }else{
                const products = await ProductModel.find({$and:[{ price: { $gt: minAmount, $lt: maxAmount }},{listStatus: true}, {deleteStatus: false}]}).skip((pageNum - 1) * perPage).limit(perPage);
                const documents = await ProductModel.countDocuments({$and:[{ price: { $gt: minAmount, $lt: maxAmount }},{listStatus: true}, {deleteStatus: false}]})
                
                docCount = documents
                pages = Math.ceil(docCount / perPage)
            
                let countPages = []
                for (let i = 0; i < pages; i++) {
                
                    countPages[i] = i + 1
                }

                console.log('category',category)
                docCount= documents
                const categoryName = await CategoryModel.find({deleteStatus:false,listStatus:true});
                res.render("user/shop", { products,categoryName,category,minAmount,maxAmount,countPages})

            }
        }else{
            let documents = await ProductModel.countDocuments({listStatus: true, deleteStatus: false})




            console.log('going through else.',req.query.category,'category')
            let products = await ProductModel.find({listStatus: true, deleteStatus: false});
            if(req.query.category){ // "/shop?category=men" from front end
                products = await ProductModel.find({category:req.query.category,listStatus: true, deleteStatus: false})
                documents = await ProductModel.countDocuments({category:req.query.category,listStatus: true, deleteStatus: false})

            }
            docCount= documents
            pages = Math.ceil(docCount / perPage)
            
            let countPages = []
            for (let i = 0; i < pages; i++) {
            
                countPages[i] = i + 1
            }
            const categoryName = await CategoryModel.find({deleteStatus:false,listStatus:true});
            return res.render("user/shop",{products,categoryName,maxAmount,minAmount});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, error: "Something went wrong on the server." }); 
    }
};


const search = async (req,res)=>{
    try{
        let searchs = req.query.search;
        console.log(searchs,'searchs')
        // let searchProduct = await productHelper.searchProduct(search);
        var search = new RegExp(searchs, 'i')
        console.log(search)
        const searchProduct = await ProductModel.find({ $or: [{ name: search }] })
        console.log(searchProduct,'ver')
        res.json(searchProduct);
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }

}


module.exports = {
    productList,
    productDetailsView,
    shopView,
    search
};
