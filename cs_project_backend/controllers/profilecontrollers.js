import FacultyModel from "../models/faculty_model.js";
import StudentModel from "../models/student_model.js";
import UserModel from "../models/user_model.js";
import CourseModel from "../models/course_model.js"; 
import ScheduleModel from "../models/schedule_model.js"; 


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
// FACULTY PROFILE MANAGEMENT (Role 1)
// -----------------------------------------------------------------

// GET /api/v1/profile/faculty
export const getMyFacultyProfile = async (req, res) => {
    try {
        const faculty = await FacultyModel.findOne({ user: req.user._id });
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        return res.status(200).json(mapFacultyToFlutter(faculty));
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

// POST/PUT /api/v1/profile/faculty
export const updateOrCreateFacultyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const facultyData = req.body;
        
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
// STUDENT PROFILE COMPLETION (Role 0)
// -----------------------------------------------------------------

// POST /api/v1/profile/student
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
// ADMIN FACULTY LIST FETCH (Role 2)
// -----------------------------------------------------------------

// GET /api/v1/dashboard/faculties
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


// -----------------------------------------------------------------
// ADMIN FACULTY UPDATE (Role 2)
// -----------------------------------------------------------------

// PUT /api/v1/dashboard/faculty/:id
export const adminUpdateFaculty = async (req, res) => {
    try {
        const { id } = req.params; // Mongoose _id of the faculty document
        const facultyData = req.body; 

        // 1. Find and update the faculty document by Mongoose _id
        const updatedFaculty = await FacultyModel.findByIdAndUpdate(
            id,
            facultyData,
            { new: true, runValidators: true }
        );

        if (!updatedFaculty) {
            return res.status(404).json({ message: 'Faculty member not found.' });
        }

        // 2. Return the updated data mapped to the Flutter structure
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
// FACULTY DASHBOARD DATA API (Role 1)
// -----------------------------------------------------------------

// GET /api/v1/dashboard/faculty/data (Main dashboard data fetch)
export const getFacultyDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Find the Faculty Profile
        const facultyProfile = await FacultyModel.findOne({ user: userId })
            .select('_id name department subject facultyId courseTeaching'); 
        
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


        // Return combined data structure to minimize API calls from Flutter
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