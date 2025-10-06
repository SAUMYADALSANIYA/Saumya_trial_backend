import student_model from "../models/student_model.js";

export const redirectToDashboard = async (req,res) => {
    const {role,_id} = req.user;
    if (role=== 0){
        const Student = await student_model.findOne({user: _id});
        if(!Student || !Student.profilestatus){
            return res.json({redirect: '/api/v1/profile/student'});
        }
        else{
        return res.json({path: '/api/v1/dashboard/student'});}
    }
    if (role=== 1){
        return res.json({path: '/api/v1/dashboard/faculty'});
    }
    if (role=== 2){
        return res.json({path: '/api/v1/dashboard/admin'});
    }
    res.status(400).json({message: 'Unknown role'});
};