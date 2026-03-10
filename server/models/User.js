import mongoose from "mongoose";
const {Schema, model} = mongoose

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    hashedPassword:{
        type:String,
        required:true,
    },
    firstName:{
        type:String,
        required: true
    },
    lastName:{
        type:String,
        required:true
    }

})

export default model("User", UserSchema)