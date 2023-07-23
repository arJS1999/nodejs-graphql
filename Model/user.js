const mongoose= require('mongoose')
const bcrypt=require('bcrypt')
const auth= new mongoose.Schema({
name:{
	type:String
},
password:{
	type:String
},age:{
	type:Number
},
},{timestamps:true})
auth.pre('save',async function(next){
	try{
		const salt = await bcrypt.genSalt(2);
		const hashedpsw = await bcrypt.hash(this.password, salt);
this.password=hashedpsw;
next()
	}catch(error){
		next(error)
	}
})

const authdata=mongoose.model('authdata',auth)
module.exports=authdata