import student_model from "../models/student_model.js";
import user_model from "../models/user_model.js";
import FacultyModel from "../models/faculty_model.js";
import StudentModel from "../models/student_model.js";
import UserModel from "../models/user_model.js";
import CourseModel from "../models/course_model.js"; 
import ScheduleModel from "../models/schedule_model.js"; 

const mapFacultyToFlutter = (faculty) => ({
    _id: faculty._id,
    id: faculty.facultyId, 
    name: faculty.name,
    subject: faculty.subject,
    department: faculty.department,
    email: faculty.email,
    phone: faculty.phone,
    designation: faculty.designation,
    qualification: faculty.qualification,
});

// -----------------------------------------------------------------
// REFACTORED: This function now requires 'userId' in the body
// -----------------------------------------------------------------
const studentdetail = async (req,res)=>{
    try{
       // 'userId' is now expected in the body
       const {userId, enrollmentId, course, DOB, Gender, Year, Nationality, Religion, State} = req.body;

       if (!userId) {
           return res.status(400).json({ message: "userId is required in the body." });
       }

       const existing = await student_model.findOne({user: userId});

       if(existing){
        return res.status(400).json({message: "Student profile already exists"});
       }

        const user = await user_model.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

       const Student = new student_model({
        user: user._id, // Use the userId from the body
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
        console.error("Error in studentdetail:", error); // Added better logging
        res.json({success: false, error: error.message });
    }
};

export default studentdetail;


// -----------------------------------------------------------------
// REFACTORED: This function now requires 'userId' in the body
// -----------------------------------------------------------------
export const getMyFacultyProfile = async (req, res) => {
    try {
        const { userId } = req.body; // Get userId from body
        if (!userId) {
            return res.status(400).json({ message: "userId is required in the body." });
        }

        const faculty = await FacultyModel.findOne({ user: userId });
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        return res.status(200).json(mapFacultyToFlutter(faculty));
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

// -----------------------------------------------------------------
// REFACTORED: This function now requires 'userId' in the body
// -----------------------------------------------------------------
export const updateOrCreateFacultyProfile = async (req, res) => {
    try {
        const { userId, ...facultyData } = req.body; // Separate userId from the rest
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required in the body." });
        }
        
        let faculty = await FacultyModel.findOne({ user: userId });
        let isNew = !faculty;
        
        const dataToSave = {
            ...facultyData,
            user: userId,
            profilestatus: true, 
        };
        
        if (isNew) {
            faculty = await FacultyModel.create(dataToSave); 
            return res.status(201).json({ 
                message: 'Profile created successfully.',
                faculty: mapFacultyToFlutter(faculty)
            });
        } else {
            faculty = await FacultyModel.findByIdAndUpdate(
                faculty._id,
                dataToSave,
                { new: true, runValidators: true }
            );
            return res.status(200).json({ 
                message: 'Profile updated successfully.',
                faculty: mapFacultyToFlutter(faculty)
            });
        }
    } catch (error) {
        if (error.code === 11000) {
             return res.status(400).json({ message: `A profile with this ID or email already exists.` });
        }
        console.error("Error saving faculty profile:", error);
        return res.status(500).json({ message: 'Failed to save profile', error: error.message });
    }
};


// -----------------------------------------------------------------
// STUDENT PROFILE (This route was already public)
// -----------------------------------------------------------------
export const getStudentProfileById = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from URL
        const student = await StudentModel.findOne({ user: userId });
        
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const profileData = {
            _id: student._id,
            name: student.name,
            email: student.email,
            phone: student.number,
            rollNumber: student.enrollmentId,
            age: student.age,
            department: student.course,
        };

        return res.status(200).json({ success: true, data: profileData });

    } catch (error) {
        console.error("Error fetching student profile:", error);
        return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};


// -----------------------------------------------------------------
// ADMIN FACULTY LIST & UPDATE (These were already public)
// -----------------------------------------------------------------
export const getFaculties = async (req, res) => {
    // ... (This function is unchanged)
    try {
        const faculties = await FacultyModel.find().select('_id facultyId name subject department');
        const facultyList = faculties.map(f => mapFacultyToFlutter(f));
        return res.status(200).json(facultyList); 
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return res.status(500).json({ message: 'Failed to fetch faculties', error: error.message });
    }
};

export const adminUpdateFaculty = async (req, res) => {
    // ... (This function is unchanged)
    try {
        const { id } = req.params; 
        const facultyData = req.body; 

        const updatedFaculty = await FacultyModel.findByIdAndUpdate(
            id,
            facultyData,
            { new: true, runValidators: true }
        );

        if (!updatedFaculty) {
            return res.status(404).json({ message: 'Faculty member not found.' });
        }
        
        return res.status(200).json({ 
            message: 'Faculty profile updated successfully by Admin.',
            faculty: mapFacultyToFlutter(updatedFaculty)
        });

    } catch (error) {
        if (error.code === 11000) {
             return res.status(400).json({ message: `A faculty member with this ID or email already exists.` });
        }
        console.error("Error updating faculty profile by Admin:", error);
        return res.status(500).json({ message: 'Failed to update faculty profile', error: error.message });
    }
};


// -----------------------------------------------------------------
// FACULTY DASHBOARD DATA API (This was already public-facing)
// -----------------------------------------------------------------
export const getFacultyDashboardData = async (req, res) => {
    // ... (This function is unchanged)
    try {
        const userId = req.query.userId; 
        if (!userId) {
            return res.status(400).json({ 
                message: "Please provide the target user's Mongoose ID in the query parameter (e.g., ?userId=...).",
            });
        }
        // ... (rest of the function is fine)
        const facultyProfile = await FacultyModel.findOne({ user: userId })
            .select('_id name department subject facultyId courseTeaching user');
        
        if (!facultyProfile) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        
        const assignedCourses = await CourseModel.find({ 
            courseCode: { $in: facultyProfile.courseTeaching } 
        }).select('courseCode name');

        const classSchedule = await ScheduleModel.find({ faculty: facultyProfile._id })
            .populate('course', 'name courseCode') 
            .select('day startTime endTime location course');

        const mappedSchedule = classSchedule.map(schedule => ({
            day: schedule.day,
            time: `${schedule.startTime} - ${schedule.endTime}`,
            courseName: schedule.course.name,
            courseCode: schedule.course.courseCode,
            location: schedule.location,
        }));


        return res.status(200).json({
            message: 'Dashboard data fetched successfully',
            profile: mapFacultyToFlutter(facultyProfile),
            coursesAssigned: assignedCourses.map(c => ({ 
                name: c.name, 
                code: c.courseCode 
            })),
            schedule: mappedSchedule,
        });

    } catch (error) {
        console.error("Error fetching faculty dashboard data:", error);
        return res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    }
};