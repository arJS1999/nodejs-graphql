const {buildSchema} = require('graphql');

module.exports = buildSchema(`
type TestData{
    text:String!
    views:Int!
}
type User{
     name: String!
     password: String!
     age:Int!
}
input UserInputdata {
    age:Int
    name: String!
    password: String
}
    type RootQuery{
        person : TestData!
    }
    type RootMutation {
        Addnew(userInput:UserInputdata):User!
        Fetchdata(userInput:UserInputdata):User!

    }
    schema{
        query : RootQuery,
        mutation:RootMutation
    }
`);