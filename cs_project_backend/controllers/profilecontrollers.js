import FacultyModel from "../models/faculty_model.js";
import StudentModel from "../models/student_model.js";
import UserModel from "../models/user_model.js";
import CourseModel from "../models/course_model.js"; 
import ScheduleModel from "../models/schedule_model.js"; 

// Placeholder ID for actions where authentication is intentionally skipped
const ANONYMOUS_ID = '000000000000000000000001'; 


// -----------------------------------------------------------------
// UTILITY: Map Faculty data to Flutter's expected structure
// -----------------------------------------------------------------
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
// FACULTY PROFILE MANAGEMENT (Role 1 & Admin POST)
// -----------------------------------------------------------------

// GET /api/v1/profile/faculty (Requires Auth)
export const getMyFacultyProfile = async (req, res) => {
    try {
        const faculty = await FacultyModel.findOne({ user: req.user._id });
        // ... (rest of the logic)
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        return res.status(200).json(mapFacultyToFlutter(faculty));
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

// POST /dashboard/faculty (Admin Add) OR POST/PUT /profile/faculty (Self Update)
export const updateOrCreateFacultyProfile = async (req, res) => {
    try {
        // FIX: Use req.user?._id for self-update, otherwise use placeholder for Admin creation
        // Note: For Admin POST, we use the ANONYMOUS_ID placeholder.
        const userId = req.user ? req.user._id : ANONYMOUS_ID; 
        const facultyData = req.body;
        
        let faculty;
        let isNew = true;

        if (req.user) {
            // If authenticated, we check for an existing profile linked to the user.
            faculty = await FacultyModel.findOne({ user: userId });
            isNew = !faculty;
        } 
        
        // If we are adding via Admin (req.user is undefined), we force creation logic.
        if (!req.user && facultyData.facultyId) {
             // If Admin is posting, check if the Faculty ID already exists as a profile
             const existing = await FacultyModel.findOne({ facultyId: facultyData.facultyId });
             if(existing) {
                // If the Admin POSTs a profile that already exists, treat it as an unauthorized duplicate POST.
                 return res.status(400).json({ message: `Faculty profile with ID ${facultyData.facultyId} already exists.` });
             }
        }
        
        const dataToSave = {
            ...facultyData,
            user: userId, // Link to the placeholder ID
            profilestatus: true, 
        };
        
        if (isNew) {
            // CREATE NEW PROFILE (Happens during Admin POST or first Faculty self-POST)
            faculty = await FacultyModel.create(dataToSave); 
            return res.status(201).json({ 
                message: 'Profile created successfully.',
                faculty: mapFacultyToFlutter(faculty)
            });
        } else {
            // UPDATE EXISTING PROFILE (Happens during Faculty self-PUT)
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
// STUDENT PROFILE COMPLETION (Auth Required)
// -----------------------------------------------------------------

export const studentdetail = async (req,res)=>{
    try{
       const {enrollmentId,course,DOB,Gender,Year,Nationality,Religion,State} = req.body;
       const existing = await StudentModel.findOne({user: req.user._id});
       
       if(existing){
        return res.status(400).json({message: "Student profile already exists"});
       }

        const user = await UserModel.findById(req.user._id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

       const Student = new StudentModel({
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

       return res.status(201).send({success: true, message: 'Student profile saved',data: Student });
    }
    catch(error){
        console.error("Error saving student detail:", error);
        res.status(500).json({success: false, error: error.message});
    }
};


// -----------------------------------------------------------------
// ADMIN FACULTY LIST & UPDATE (NO AUTH)
// -----------------------------------------------------------------

export const getFaculties = async (req, res) => {
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
// FACULTY DASHBOARD DATA API (NO AUTH - Requires query param)
// -----------------------------------------------------------------

export const getFacultyDashboardData = async (req, res) => {
    try {
        // Must rely on user ID passed in the query parameter (e.g., ?userId=...)
        const userId = req.query.userId; 

        if (!userId) {
            return res.status(400).json({ 
                message: "Authentication is disabled. Please provide the target user's Mongoose ID in the query parameter (e.g., ?userId=...).",
            });
        }
        
        // 1. Find the Faculty Profile linked to that userId
        const facultyProfile = await FacultyModel.findOne({ user: userId })
            .select('_id name department subject facultyId courseTeaching user'); 
        
        if (!facultyProfile) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        
        // 2. Fetch Assigned Courses details
        const assignedCourses = await CourseModel.find({ 
            courseCode: { $in: facultyProfile.courseTeaching } 
        }).select('courseCode name');

        // 3. Fetch Class Schedule
        const classSchedule = await ScheduleModel.find({ faculty: facultyProfile._id })
            .populate('course', 'name courseCode') 
            .select('day startTime endTime location course');

        // Map schedule data to match Flutter's expected structure
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
