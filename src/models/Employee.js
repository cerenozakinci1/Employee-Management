const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
name:{
type:String,
required:true,
trim:true,
},
employeeId:{
type:String,
required:true,
unique:true,
},
password:{
type:String,
required:true
},
role:{
type: String,
enum: ["Admin", "User"],
default:"User"
},
department:{
type: String,
required:true,
}
});

module.exports =mongoose.model("Employee", employeeSchema);