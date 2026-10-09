// server/config/mongoConnection.js
// ===================================
// PURPOSE: Create a reusable MongoDB connection.
//
// CS 546 BRIDGE:
// In Lab 4, you probably connected to MongoDB inside each data function.
// Here, we create ONE connection and reuse it everywhere.
// This is called the "Singleton Pattern" — one shared resource.

import { MongoClient } from "mongodb";

let _connection = undefined; // The connection object (reused)
let _db = undefined; // The database object (reused)

/**
 * Connects to MongoDB Atlas and returns the database object.
 * If already connected, returns the existing connection.
 */
const dbConnection = async () => {
  if (!_connection) {
    // First time: create the connection
    _connection = await MongoClient.connect(process.env.MONGODB_URI);
    _db = _connection.db(); // Uses the database name from the URI
  }
  return _db;
};

/**
 * Closes the MongoDB connection.
 * Used when shutting down the server cleanly.
 */
const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = undefined;
    _db = undefined;
  }
};

export { dbConnection, closeConnection };
