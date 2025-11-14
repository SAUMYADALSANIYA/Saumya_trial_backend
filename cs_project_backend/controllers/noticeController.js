


import NoticeModel from "../models/notice_model.js";

// @desc    Get all recent notices
// @route   GET /api/v1/notices
// @access  Public
export const getAllNotices = async (req, res) => {
    try {
        const notices = await NoticeModel.find().sort({ date: -1 }).limit(20);

        return res.status(200).json({
            success: true,
            count: notices.length,
            data: notices,
        });
    } catch (error) {
        console.error("Error fetching notices:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Create a new notice
// @route   POST /api/v1/notices
// @access  Public
export const createNotice = async (req, res) => {
    try {
        const { title, description, level, createdBy } = req.body; // Expect createdBy in body
        if (!title || !description || !createdBy) {
            return res.status(400).json({ success: false, message: "Title, description, and createdBy are required" });
        }

        const newNotice = await NoticeModel.create({
            title,
            description,
            level,
            createdBy: createdBy,
        });

        return res.status(201).json({
            success: true,
            message: "Notice created successfully",
            data: newNotice,
        });

    } catch (error) {
        console.error("Error creating notice:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};