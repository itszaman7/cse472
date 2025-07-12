const express = require('express');
const router = express.Router();
const { ObjectId } = require("mongodb");

// Helper function to validate file data
const validateFileData = (file) => {
    if (!file.name || !file.type || !file.data) {
        return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
        return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        return false;
    }

    return true;
};

// Create new report
router.post('/', async (req, res) => {
    try {
        const reportData = req.body;
        const reportsCollection = req.reportsCollection;

        // Validate required fields
        if (!reportData.title || !reportData.description || !reportData.location ||
            !reportData.category || !reportData.threatLevel) {
            return res.status(400).json({
                message: "All required fields must be filled"
            });
        }

        // Validate attachments if present
        if (reportData.attachments && reportData.attachments.length > 0) {
            if (reportData.attachments.length > 5) {
                return res.status(400).json({
                    message: "Maximum 5 files allowed"
                });
            }

            for (const file of reportData.attachments) {
                if (!validateFileData(file)) {
                    return res.status(400).json({
                        message: `Invalid file: ${file.name}. Please ensure files are images/videos and under 5MB.`
                    });
                }
            }
        }

        const enhancedReportData = {
            ...reportData,
            createdAt: new Date(),
            updatedAt: new Date(),
            attachmentCount: reportData.attachments ? reportData.attachments.length : 0,
            comments: [],
            reactions: [],
            authenticityLevel: 0,
            authenticityVotes: [],
             sentiment: {
            overall: 'neutral', // Possible values: 'positive', 'negative', 'neutral', 'mixed'
            positiveCount: 0,
            negativeCount: 0,
            neutralCount: 0
            }
        };

        const result = await reportsCollection.insertOne(enhancedReportData);

        res.status(201).json({
            message: "Report submitted successfully!",
            insertedId: result.insertedId,
            attachmentCount: enhancedReportData.attachmentCount
        });

    } catch (error) {
        console.error("Failed to save report:", error);

        if (error.name === 'MongoError' && error.code === 11000) {
            res.status(409).json({
                message: "Duplicate report detected"
            });
        } else if (error.name === 'ValidationError') {
            res.status(400).json({
                message: "Invalid data format"
            });
        } else {
            res.status(500).json({
                message: "Error saving report to the database"
            });
        }
    }
});

// Get all reports
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, city, category, threatLevel } = req.query;
        const reportsCollection = req.reportsCollection;

        let filter = {};
        if (city) filter.city = city;
        if (category) filter.category = category;
        if (threatLevel) filter.threatLevel = threatLevel;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reports = await reportsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        const total = await reportsCollection.countDocuments(filter);

        res.json({
            reports,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalReports: total,
                hasNext: skip + parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error("Failed to fetch reports:", error);
        res.status(500).json({
            message: "Error fetching reports from the database"
        });
    }
});

// Get single report by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        const report = await reportsCollection.findOne({ _id: new ObjectId(id) });

        if (!report) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.json(report);

    } catch (error) {
        console.error("Failed to fetch report:", error);
        res.status(500).json({
            message: "Error fetching report from the database"
        });
    }
});

// Update report status (for admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        const allowedStatuses = ['pending', 'reviewed', 'resolved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        const result = await reportsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.json({
            message: "Report status updated successfully"
        });

    } catch (error) {
        console.error("Failed to update report status:", error);
        res.status(500).json({
            message: "Error updating report status"
        });
    }
});

module.exports = router;