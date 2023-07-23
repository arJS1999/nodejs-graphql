const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Ndtask = sequelize.define( 'nodetask', {
    
    id: {
       type: Sequelize.INTEGER,
       primaryKey:true,
       autoIncrement:true 
    },
    name:{
        type:Sequelize.STRING
    },
    password:{
        type:Sequelize.STRING
    },
    image:{
        type:Sequelize.STRING
    }

});


module.exports = Ndtask;