import student_model from "../models/student_model.js";
import AssignmentModel from "../models/assignment_model.js";
// import NoticeModel from "../models/notice_model.js";
import ComplaintModel from "../models/complaint_model.js";
import UserModel from "../models/user_model.js"; 
const ANONYMOUS_ID = '000000000000000000000001'; 

const mapStudentToFlutter = (s) => ({
    _id: s._id,
    name: s.name,
    email: s.email,
    phone: s.phone || s.number, 
    rollNumber: s.rollNumber || s.enrollmentId,
    age: s.age || 'N/A',
    department: s.department || s.course || 'N/A',
});


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

export const getStudents = async (req, res) => {
    try {
        const students = await student_model.find().select('_id name email number enrollmentId course'); 
        return res.status(200).json(students.map(mapStudentToFlutter)); 
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};



export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params; 
        const deletedStudent = await student_model.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        return res.status(200).json({ 
            message: 'Student deleted successfully', 
            deletedId: id 
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        return res.status(500).json({ message: 'Failed to delete student', error: error.message });
    }
};

// UPDATE: Update Student
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params; 
        const studentData = req.body; 

        // Reverting the name fix and using the original, simpler implementation
        if (!studentData || Object.keys(studentData).length === 0) {
             return res.status(400).json({ message: 'Request body cannot be empty for update.' });
        }
        
        // Using studentData directly, which was the original code before complex fixes
        const updatedStudent = await StudentModel.findByIdAndUpdate(
            id,
            studentData, 
            { new: true, runValidators: true } 
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        // Ensure properties are accessible for mapping
        const studentObject = updatedStudent.toObject ? updatedStudent.toObject() : updatedStudent;

        return res.status(200).json({
            message: 'Student updated successfully',
            student: mapStudentToFlutter(studentObject)
        });

    } catch (error) {
        if (error.code === 11000) {
             return res.status(400).json({ message: `A student with this roll number or email already exists.` });
        }
        console.error("Error updating student:", error); 
        return res.status(500).json({ message: 'Failed to update student', error: error.message });
    }
};

// -----------------------------------------------------------------
// ASSIGNMENT & NOTICE APIs (NO AUTH)
// -----------------------------------------------------------------
export const createAssignment = async (req, res) => {
    try {
        const createdBy = ANONYMOUS_ID; 
        const { title, description, due_date } = req.body;

        const newAssignment = await AssignmentModel.create({
            title,
            description,
            dueDate: due_date, 
            createdBy, 
        });

        return res.status(201).json({ 
            message: 'Assignment created successfully',
            assignment: newAssignment
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({ message: 'Failed to create assignment', error: error.message });
    }
};

// export const createNotice = async (req, res) => {
//     try {
//         const createdBy = ANONYMOUS_ID; 
//         const { title, description, date } = req.body;

//         const newNotice = await NoticeModel.create({
//             title,
//             description,
//             date, 
//             createdBy,
//         });

//         return res.status(201).json({ 
//             message: 'Notice created successfully',
//             notice: newNotice
//         });
//     } catch (error) {
//         console.error("Error creating notice:", error);
//         return res.status(500).json({ message: 'Failed to create notice', error: error.message });
//     }
// };

// export const getNotices = async (req, res) => {
//     try {
//         const notices = await NoticeModel.find()
//             .sort({ date: -1, createdAt: -1 }) 
//             .limit(20) 
//             .select('title description date createdAt');

//         const formattedNotices = notices.map(n => ({
//             title: n.title,
//             description: n.description,
//             date: n.date ? n.date.toISOString().split('T')[0] : 'N/A', 
//         }));
        
//         return res.status(200).json(formattedNotices);
//     } catch (error) {
//         console.error("Error fetching notices:", error);
//         return res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
//     }
// };

// // -----------------------------------------------------------------
// COMPLAINT API (NO AUTH)
// -----------------------------------------------------------------
export const submitComplaint = async (req, res) => {
    try {
        const { content, filedByUserId } = req.body; 
        const userId = filedByUserId || ANONYMOUS_ID; 
        let modelName = 'Admin'; 
        
        if (!content) {
            return res.status(400).json({ message: 'Complaint content is required.' });
        }

        const newComplaint = await ComplaintModel.create({
            content,
            filedBy: userId,
            filedByModel: modelName,
            status: 'New',
        });

        return res.status(201).json({ 
            message: `Complaint submitted successfully with ID: ${newComplaint._id}`,
            complaint: newComplaint
        });
    } catch (error) {
        console.error("Error submitting complaint:", error);
        return res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
    }
};