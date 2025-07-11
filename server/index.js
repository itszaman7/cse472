const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
    credentials: true,
}));
app.use(cookieParser());

// Increase payload limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MongoDB Configuration ---
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

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

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");

        const database = client.db('CSE472');
        const reportsCollection = database.collection('incidentReports');

        // --- API Endpoints ---

        // Create new report
        app.post('/posts', async (req, res) => {
            try {
                const reportData = req.body;

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

                // Enhanced report data with new fields
                const enhancedReportData = {
                    ...reportData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    attachmentCount: reportData.attachments ? reportData.attachments.length : 0,
                    // New fields for interactions
                    comments: [],
                    reactions: [],
                    authenticityLevel: 0, // Initial authenticity level
                    authenticityVotes: [] // Array to track who voted and their vote
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
        app.get('/posts', async (req, res) => {
            try {
                const { page = 1, limit = 10, city, category, threatLevel } = req.query;
                
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
        app.get('/posts/:id', async (req, res) => {
            try {
                const { id } = req.params;
                
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

        // Add comment to report
        app.post('/posts/:id/comments', async (req, res) => {
            try {
                const { id } = req.params;
                const { userName, comment } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ 
                        message: "Invalid report ID" 
                    });
                }

                if (!userName || !comment) {
                    return res.status(400).json({ 
                        message: "Username and comment are required" 
                    });
                }

                const newComment = {
                    id: new ObjectId(),
                    userName: userName.trim(),
                    comment: comment.trim(),
                    createdAt: new Date()
                };

                const result = await reportsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { 
                        $push: { comments: newComment },
                        $set: { updatedAt: new Date() }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ 
                        message: "Report not found" 
                    });
                }

                res.json({ 
                    message: "Comment added successfully",
                    comment: newComment
                });

            } catch (error) {
                console.error("Failed to add comment:", error);
                res.status(500).json({ 
                    message: "Error adding comment" 
                });
            }
        });

        // Add reaction to report
        app.post('/posts/:id/reactions', async (req, res) => {
            try {
                const { id } = req.params;
                const { userName, reactionType } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ 
                        message: "Invalid report ID" 
                    });
                }

                if (!userName || !reactionType) {
                    return res.status(400).json({ 
                        message: "Username and reaction type are required" 
                    });
                }

                const validReactions = ['👍', '👎', '😢', '😮', '😡', '❤️'];
                if (!validReactions.includes(reactionType)) {
                    return res.status(400).json({ 
                        message: "Invalid reaction type" 
                    });
                }

                // Check if user already reacted
                const existingReport = await reportsCollection.findOne({ _id: new ObjectId(id) });
                if (!existingReport) {
                    return res.status(404).json({ 
                        message: "Report not found" 
                    });
                }

                const existingReactionIndex = existingReport.reactions.findIndex(
                    reaction => reaction.userName === userName.trim()
                );

                let updateOperation;
                if (existingReactionIndex !== -1) {
                    // Update existing reaction
                    updateOperation = {
                        $set: { 
                            [`reactions.${existingReactionIndex}.reactionType`]: reactionType,
                            [`reactions.${existingReactionIndex}.updatedAt`]: new Date(),
                            updatedAt: new Date()
                        }
                    };
                } else {
                    // Add new reaction
                    const newReaction = {
                        id: new ObjectId(),
                        userName: userName.trim(),
                        reactionType: reactionType,
                        createdAt: new Date()
                    };

                    updateOperation = {
                        $push: { reactions: newReaction },
                        $set: { updatedAt: new Date() }
                    };
                }

                const result = await reportsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    updateOperation
                );

                res.json({ 
                    message: existingReactionIndex !== -1 ? "Reaction updated successfully" : "Reaction added successfully"
                });

            } catch (error) {
                console.error("Failed to add reaction:", error);
                res.status(500).json({ 
                    message: "Error adding reaction" 
                });
            }
        });

        // Remove reaction from report
        app.delete('/posts/:id/reactions', async (req, res) => {
            try {
                const { id } = req.params;
                const { userName } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ 
                        message: "Invalid report ID" 
                    });
                }

                if (!userName) {
                    return res.status(400).json({ 
                        message: "Username is required" 
                    });
                }

                const result = await reportsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { 
                        $pull: { reactions: { userName: userName.trim() } },
                        $set: { updatedAt: new Date() }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ 
                        message: "Report not found" 
                    });
                }

                res.json({ 
                    message: "Reaction removed successfully"
                });

            } catch (error) {
                console.error("Failed to remove reaction:", error);
                res.status(500).json({ 
                    message: "Error removing reaction" 
                });
            }
        });

        // Vote on authenticity
        app.post('/posts/:id/authenticity', async (req, res) => {
            try {
                const { id } = req.params;
                const { userName, vote } = req.body; // vote: 'authentic' or 'fake'

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ 
                        message: "Invalid report ID" 
                    });
                }

                if (!userName || !vote) {
                    return res.status(400).json({ 
                        message: "Username and vote are required" 
                    });
                }

                if (!['authentic', 'fake'].includes(vote)) {
                    return res.status(400).json({ 
                        message: "Vote must be 'authentic' or 'fake'" 
                    });
                }

                const existingReport = await reportsCollection.findOne({ _id: new ObjectId(id) });
                if (!existingReport) {
                    return res.status(404).json({ 
                        message: "Report not found" 
                    });
                }

                const existingVoteIndex = existingReport.authenticityVotes.findIndex(
                    voteItem => voteItem.userName === userName.trim()
                );

                let updateOperation;
                if (existingVoteIndex !== -1) {
                    // Update existing vote
                    updateOperation = {
                        $set: { 
                            [`authenticityVotes.${existingVoteIndex}.vote`]: vote,
                            [`authenticityVotes.${existingVoteIndex}.updatedAt`]: new Date(),
                            updatedAt: new Date()
                        }
                    };
                } else {
                    // Add new vote
                    const newVote = {
                        id: new ObjectId(),
                        userName: userName.trim(),
                        vote: vote,
                        createdAt: new Date()
                    };

                    updateOperation = {
                        $push: { authenticityVotes: newVote },
                        $set: { updatedAt: new Date() }
                    };
                }

                await reportsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    updateOperation
                );

                // Recalculate authenticity level
                const updatedReport = await reportsCollection.findOne({ _id: new ObjectId(id) });
                const authenticVotes = updatedReport.authenticityVotes.filter(v => v.vote === 'authentic').length;
                const fakeVotes = updatedReport.authenticityVotes.filter(v => v.vote === 'fake').length;
                const totalVotes = authenticVotes + fakeVotes;
                
                let authenticityLevel = 0;
                if (totalVotes > 0) {
                    authenticityLevel = Math.round((authenticVotes / totalVotes) * 100);
                }

                await reportsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { authenticityLevel: authenticityLevel } }
                );

                res.json({ 
                    message: "Authenticity vote recorded successfully",
                    authenticityLevel: authenticityLevel,
                    totalVotes: totalVotes
                });

            } catch (error) {
                console.error("Failed to record authenticity vote:", error);
                res.status(500).json({ 
                    message: "Error recording authenticity vote" 
                });
            }
        });

        // Delete comment (only by the comment author)
        app.delete('/posts/:id/comments/:commentId', async (req, res) => {
            try {
                const { id, commentId } = req.params;
                const { userName } = req.body;

                if (!ObjectId.isValid(id) || !ObjectId.isValid(commentId)) {
                    return res.status(400).json({ 
                        message: "Invalid report ID or comment ID" 
                    });
                }

                if (!userName) {
                    return res.status(400).json({ 
                        message: "Username is required" 
                    });
                }

                const result = await reportsCollection.updateOne(
                    { 
                        _id: new ObjectId(id),
                        "comments.id": new ObjectId(commentId),
                        "comments.userName": userName.trim()
                    },
                    { 
                        $pull: { comments: { id: new ObjectId(commentId) } },
                        $set: { updatedAt: new Date() }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ 
                        message: "Report not found, comment not found, or you don't have permission to delete this comment" 
                    });
                }

                res.json({ 
                    message: "Comment deleted successfully"
                });

            } catch (error) {
                console.error("Failed to delete comment:", error);
                res.status(500).json({ 
                    message: "Error deleting comment" 
                });
            }
        });

        // Update report status (for admin)
        app.patch('/posts/:id/status', async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                
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

    } catch (error) {
        console.error("Failed to connect to MongoDB and set up routes:", error);
    }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Backend connected and listening for requests!')
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});