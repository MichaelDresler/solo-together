import mongoose from "mongoose";
const {Schema, model} = mongoose

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        default: "",
    },
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
    },
    avatarUrl: {
        type: String,
        default: "",
    },
    avatarPublicId: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["member", "admin", "super_admin"],
        default: "member",
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
    },

}, { timestamps: true })

export default model("User", UserSchema)
