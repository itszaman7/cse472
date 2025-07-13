const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

// --- Route Imports ---
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const reactionRoutes = require('./routes/reactions');
const authenticityRoutes = require('./routes/authenticity');
const redditRoutes = require('./routes/reddit');

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

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");

        const database = client.db('CSE472');
        const reportsCollection = database.collection('incidentReports');

        // --- Middleware to pass database collection to routes ---
        app.use((req, res, next) => {
            req.reportsCollection = reportsCollection;
            next();
        });

        // --- API Endpoints ---
        app.use('/posts', postRoutes);
        app.use('/posts', commentRoutes);
        app.use('/posts', reactionRoutes);
        app.use('/posts', authenticityRoutes);
        app.use('/api/reddit', redditRoutes); 


    } catch (error) {
        console.error("Failed to connect to MongoDB and set up routes:", error);
    }
}

run().catch(console.dir);

// --- Root and Health Check Routes ---
app.get('/', (req, res) => {
    res.send('Backend connected and listening for requests!')
});

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