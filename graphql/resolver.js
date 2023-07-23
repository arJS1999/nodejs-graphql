const bcrypt = require('bcrypt');

const Auth=require('../Model/user');
module.exports={
  Fetchdata: async ({userInput},req) => {
    const data = await Auth.find({name:userInput.name}).then(result=>{
        console.log(result);
        var data= result[0];
        const userdata = {
          name:data.name,
          age:data.age,
            password:data.password,
        };
        console.log(userdata);
        return data;
    })
    .catch(err=>{console.log(err)});
    
    return data;
    
},
    Addnew: async function({ userInput }, req) {
        // const existingUser = await Auth.findOne({ name: userInput.name });
        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new Auth({
          age: userInput.age,
          name: userInput.name,
          password: hashedPw
        });
        const create = await user.save();
        return create;
      },
person:()=>{
        return {
            text:'hello World',
            views: 12345
        };
    }
}