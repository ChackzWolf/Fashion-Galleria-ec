const UserModel = require('../../../models/Product');

const userList = async (req,res)=>{
    try{
         const pageNum =  req.query.page;
         const perPage = 6
         let docCount
         let pages
         
         const documents = await UserModel.countDocuments()
 
         const users = await UserModel.find().skip((pageNum - 1) * perPage).limit(perPage);
         
         docCount = documents
         pages = Math.ceil(docCount / perPage)
 
         let countPages = []
         for (let i = 0; i < pages; i++) {
             countPages[i] = i + 1
         }
         console.log(countPages,'countPages')
 
         console.log(users, 'users')
         Swal.fire("SweetAlert2 is working!");
         res.render("admin/user-list",{users,countPages})
    }catch(error){
        res.status(500).render("user/error-handling");
    }
 }


 const userBlockUnblock = async (req,res) => {
     try{
         const userData = await UserModel.findOne({_id: req.query.id});
         await UserModel.updateOne({_id:req.query.id},{$set: {status: !userData.status}})
         const users = await UserModel.find();
         res.render("admin/user-list",{users});
     }catch(error){
         res.status(500).render("user/error-handling"); 
     }
 }
  

 
 const searchUser = async (req,res)=>{
         let payload = req.body.payload.trim();
         console.log(payload)
         let search = await UserModel.find({name:{$regex: new RegExp('^'+payload+'.*','i')}}).exec()
         console.log(typeof search,search)
         res.send({payload: search});
 }


 module.exports = {
    userBlockUnblock,
    userList,
    searchUser,
}  