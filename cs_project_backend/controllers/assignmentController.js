import AssignmentModel from "../models/assignment_model.js";

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Public
export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await AssignmentModel.find().sort({ dueDate: 1 });

        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments,
        });

    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ success: false, message: "Server error while fetching assignments" });
    }
};