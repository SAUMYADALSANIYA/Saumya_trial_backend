import user_model from "../models/user_model.js";
import JWT from "jsonwebtoken";
import { comaparePassword,hashPassword } from "../helpers/authHelper.js";

export const registercontroller  = async(req,res) =>{

    try{
        const{name,password,email,number,secretkey,role} = req.body;
        if(!name){
            return res.send({message: "Name is required"});
        } 
        if(!email){
            return res.send({message: "Email is required"});
        } 
        if(!password){
            return res.send({message: "Password is required"});
        } 
        if(!number){
            return res.send({message: "Number is required"});
        }
        if(!secretkey){
            return res.send({message: "Secretkey is required"});
        }
        const existinguser = await user_model.findOne({email,number})
        if(existinguser){
            return res.status(200).send({
                success: false,
                message: "Already Register please Login",
            });
        }
        const hashedPassword = await hashPassword(password)
        const user = await new user_model({name,password:hashedPassword,email,number,secretkey,role:role ||0}).save();
        res.status(201).send({
            success:true,
            message: "User Register Successfully",
            user,
        });
    }
    catch(error){
        console.log(error)
       res.status(500).send({
        success: false,
        message: "Error in Registration",
        error,

       });
    };
};

export const logincontroller = async(req,res) =>{
    try{
        const{email,password}= req.body;
if(!email || !password){
return res.status(400).send({
    success: false,
    message: "Invalid Email or Password",
});
}
const user = await user_model.findOne({email});
if(!user){
    return res.status(400).send({
        success: false,
        message: "User not found",
    });
}
const match = await comaparePassword(password, user.password);
if(!match){
    return res.status(200).send({
        success: false,
        message: "Invalid Password",
    });
}
const token = JWT.sign({_id:user._id,role: user.role},process.env.JWT_SECRET, {expiresIn: "1h",});
res.status(200).send({
    success:true,
    message:"Login Successfully",
    user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    },
    token,
});
    }
    catch(error){
    console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error,
        });
    }
};

export const forgotPasswordController = async(req,res) => {
    try {
        const {email,secretkey,newpassword} = req.body;
        if(!email){
            return res.status(400).send({message: " Email is required"});
        }
        if(!secretkey){
            return res.status(400).send({message: "SecretKey is required"});
        }
        if(!newpassword){
            return res.status(400).send({message: "New Password is required"});
        }
        const user = await user_model.findOne({email,secretkey});
        if(!user){
            return res.status(404).send({
                success:false,
                message: "Wrong Email or Answer",
            });
        }
        const hashed = await hashPassword(newpassword);
        await user_model.findByIdAndUpdate(user._id,{password: hashed});
        res.status(200).send({
            success:true,
            message:"Password Reset Sucessfully",
        });
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: "Something went wrong",
            error,
        });
    }
}
