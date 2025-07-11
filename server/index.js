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
    // Check if file object has required properties
    if (!file.name || !file.type || !file.data) {
        return false;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
        return false;
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
};

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Successfully connected to MongoDB!");

        // --- Database and Collections ---
        const database = client.db('CSE472');
        const reportsCollection = database.collection('incidentReports');

        // --- API Endpoints ---

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
                    // Check number of files
                    if (reportData.attachments.length > 5) {
                        return res.status(400).json({ 
                            message: "Maximum 5 files allowed" 
                        });
                    }

                    // Validate each file
                    for (const file of reportData.attachments) {
                        if (!validateFileData(file)) {
                            return res.status(400).json({ 
                                message: `Invalid file: ${file.name}. Please ensure files are images/videos and under 5MB.` 
                            });
                        }
                    }
                }

                // Add server-side timestamp and additional metadata
                const enhancedReportData = {
                    ...reportData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    attachmentCount: reportData.attachments ? reportData.attachments.length : 0
                };

                const result = await reportsCollection.insertOne(enhancedReportData);
                
                res.status(201).json({
                    message: "Report submitted successfully!",
                    insertedId: result.insertedId,
                    attachmentCount: enhancedReportData.attachmentCount
                });

            } catch (error) {
                console.error("Failed to save report:", error);
                
                // Handle specific MongoDB errors
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

        // Get all reports (for admin dashboard)
        app.get('/posts', async (req, res) => {
            try {
                const { page = 1, limit = 10, city, category, threatLevel } = req.query;
                
                // Build filter object
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

// A simple root route to confirm the server is running
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