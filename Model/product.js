const mongoose= require('mongoose')
const auth= new mongoose.Schema({
    name:{
        type:String
    },
    price:{
        type:Number
    },
        discount:{
            type:Number
        }


    },{timestamps:true})
 
    const authdata=mongoose.model('agg',auth)
module.exports=authdata