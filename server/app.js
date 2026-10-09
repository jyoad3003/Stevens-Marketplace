// server/app.js
// ==============
// PURPOSE: The entry point of our Express server.
//
// CS 546 BRIDGE:
// This is exactly like your Lab 5 app.js:
//   import express from "express";
//   const app = express();
//   app.listen(3000, () => { ... });
//
// The ONLY new thing here is:
//   1. dotenv — loads your .env secrets
//   2. We test the MongoDB Atlas connection on startup

import "dotenv/config"; 
import express from "express";
import session from "express-session";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import connectionRoutes from "./routes/connections.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// =============================================
// SESSION MIDDLEWARE (CS 546 Lab 10)
// =============================================
app.use(
  session({
    name: 'AuthCookie',
    secret: 'SomeSecretStringThatShouldBeInEnvLater',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 * 60 * 24 } // Cookie lasts for 1 day
  })
);

// =============================================
// ROUTES
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/connections', connectionRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const db = await dbConnection();
    await db.admin().ping();
    res.status(200).json({
      status: "ok",
      message: "Stevens Marketplace API is running",
      database: "Connected to MongoDB Atlas",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to connect to database",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Stevens Marketplace server running at http://localhost:${PORT}`);
  console.log(`📡 Test the connection: http://localhost:${PORT}/api/health\n`);
});
