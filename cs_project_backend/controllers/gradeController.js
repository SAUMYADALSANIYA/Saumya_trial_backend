import GradeModel from "../models/grade_model.js";
import StudentModel from "../models/student_model.js";

// @desc    Get grades for a specific user
// @route   GET /api/v1/grades/user/:userId
// @access  Public
export const getGradesByUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from URL

        // Find the student profile linked to the user ID
        const student = await StudentModel.findOne({ user: userId });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        // Find all grades associated with that student profile
        const grades = await GradeModel.find({ student: student._id }).select('course semester grade credits');

        return res.status(200).json({
            success: true,
            count: grades.length,
            data: grades,
        });

    } catch (error) {
        console.error("Error fetching grades:", error);
        res.status(500).json({ success: false, message: "Server error while fetching grades" });
    }
};