const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");
const { crawlAndStore } = require("./services/newsCrawler");

// --- Route Imports ---
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const reactionRoutes = require("./routes/reactions");
const authenticityRoutes = require("./routes/authenticity");
const redditRoutes = require("./routes/reddit");
const crawlerRoutes = require("./routes/crawler");

dotenv.config();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // This allows all origins
    credentials: true,
  },
});

app.set("io", io);

// --- CORS Middleware ---
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Additional CORS headers for AWS deployment
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(cookieParser());

// Increase payload limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- MongoDB Configuration ---
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Debug: Log connection details (remove in production)
console.log("Attempting to connect to MongoDB...");
console.log("DB_USER:", process.env.DB_USER ? "Set" : "Missing");
console.log("DB_PASS:", process.env.DB_PASS ? "Set" : "Missing");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const database = client.db("CSE472");
    const reportsCollection = database.collection("incidentReports");

    // --- Middleware to pass database collection to routes ---
    app.use((req, res, next) => {
      req.reportsCollection = reportsCollection;
      next();
    });

    // --- API Endpoints ---
    app.use("/posts", postRoutes);
    app.use("/posts", commentRoutes);
    app.use("/posts", reactionRoutes);
    app.use("/posts", authenticityRoutes);
    app.use("/api/reddit", redditRoutes);
    app.use("/crawler", crawlerRoutes);
    // --- Socket.io basic events ---
    io.on("connection", (socket) => {
      // Client will join a room per user email
      socket.on("join", (userEmail) => {
        if (userEmail) socket.join(`user:${userEmail}`);
      });
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB and set up routes:", error);
  }
}

run().catch(console.dir);

// --- Root and Health Check Routes ---
app.get("/", (req, res) => {
  res.send("Backend connected and listening for requests!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// --- Scheduler: run every 12 hours at minute 0 ---
// Pattern: m h dom mon dow
// Here: at 00:00 and 12:00 daily
cron.schedule(
  "0 0,12 * * *",
  async () => {
    try {
      console.log("[CRON] Starting scheduled crawl...");
      // We need access to the DB collection; reuse the middleware approach by creating a new client is heavy.
      // Instead, call crawl against the existing connection by reusing the collection from a lightweight request simulation.
      // Since we don't have global access here, we perform a small workaround by opening a short-lived client if needed.
      // Simpler: use the health check middleware path to pull a collection via an ad-hoc call.
      // Below, we fetch from the app's first middleware that attached reportsCollection by spinning a minimal request context.
      // For simplicity and reliability, we connect a short-lived MongoClient here as a fallback when the app is already running.
      const { MongoClient, ServerApiVersion } = require("mongodb");
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
      const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();
      const database = client.db("CSE472");
      const reportsCollection = database.collection("incidentReports");
      const result = await crawlAndStore(reportsCollection);
      console.log(
        `[CRON] Crawl completed. Inserted: ${result.inserted}, Skipped: ${result.skipped}`
      );
      await client.close();
    } catch (err) {
      console.error("[CRON] Crawl failed:", err);
    }
  },
  { timezone: "Asia/Dhaka" }
);
