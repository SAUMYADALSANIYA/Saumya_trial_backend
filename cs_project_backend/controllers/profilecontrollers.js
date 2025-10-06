import student_model from "../models/student_model.js";
import user_model from "../models/user_model.js";

const studentdetail = async (req,res)=>{
    try{
       const {enrollmentId,course,DOB,Gender,Year,Nationality,Religion,State} = req.body;
       const existing = await student_model.findOne({user: req.user._id});

       if(existing){
        return res.status(400).json({message: "Student profile already exists"});
       }

        const user = await user_model.findById(req.user._id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

       const Student = new student_model({
        user: user._id,
        email: user.email,
        name: user.name,
        number : user.number,
        enrollmentId,
        course,
        DOB,
        Gender,
        Year,
        Nationality,
        Religion,
        State,
        profilestatus: true
       });
       await Student.save();

       return res.status(201).send({success: true, message: 'Student profile saved',data: Student
});
    }
    catch(error){
        res.json({success: false, error});
    }
};

export default studentdetail;