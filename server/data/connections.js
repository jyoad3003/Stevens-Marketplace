import { connections, projects, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

/**
 * Validates ObjectIds
 */
const checkId = (id, varName) => {
  if (!id) throw new Error(`Error: You must provide a ${varName}`);
  if (typeof id !== 'string') throw new Error(`Error: ${varName} must be a string`);
  id = id.trim();
  if (id.length === 0) throw new Error(`Error: ${varName} cannot be an empty string or just spaces`);
  if (!ObjectId.isValid(id)) throw new Error(`Error: ${varName} invalid object ID`);
  return id;
};

/**
 * Creates a connection request from a Student to a Project
 */
export const applyToProject = async (studentId, projectId, message = "") => {
  studentId = checkId(studentId, 'Student ID');
  projectId = checkId(projectId, 'Project ID');

  // Ensure the student exists and is actually a student
  const userCollection = await users();
  const student = await userCollection.findOne({ _id: new ObjectId(studentId) });
  if (!student) throw new Error("Error: Student not found");
  if (student.role !== 'STUDENT') throw new Error("Error: Only students can apply to projects");

  // Ensure the project exists
  const projectCollection = await projects();
  const project = await projectCollection.findOne({ _id: new ObjectId(projectId) });
  if (!project) throw new Error("Error: Project not found");
  if (project.status !== 'OPEN') throw new Error("Error: Project is no longer accepting applications");

  const connectionCollection = await connections();

  // Check if the student has already applied
  const existingConnection = await connectionCollection.findOne({
    studentId: new ObjectId(studentId),
    projectId: new ObjectId(projectId)
  });

  if (existingConnection) {
    throw new Error("Error: You have already applied to this project.");
  }

  const newConnection = {
    studentId: new ObjectId(studentId),
    projectId: new ObjectId(projectId),
    mentorId: project.ownerId,
    status: 'PENDING', // PENDING, ACCEPTED, REJECTED
    message: message.trim(),
    appliedAt: new Date().toISOString()
  };

  const insertInfo = await connectionCollection.insertOne(newConnection);
  
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Error: Could not add connection");
  }

  return { applied: true, connectionId: insertInfo.insertedId.toString() };
};

/**
 * Gets all PENDING applications for projects owned by a specific Mentor
 */
export const getIncomingApplications = async (mentorId) => {
  mentorId = checkId(mentorId, 'Mentor ID');

  const connectionCollection = await connections();

  // We need to fetch connections, and join the Student's info and the Project's info
  const incoming = await connectionCollection.aggregate([
    { $match: { mentorId: new ObjectId(mentorId), status: 'PENDING' } },
    
    // Join Student Info
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },

    // Join Project Info
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },

    // Format output
    {
      $project: {
        _id: 1,
        status: 1,
        message: 1,
        appliedAt: 1,
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        studentEmail: '$student.email',
        studentSkills: '$student.skills',
        projectTitle: '$project.title',
        projectId: '$project._id'
      }
    }
  ]).toArray();

  // Convert IDs to strings
  return incoming.map(conn => {
    conn._id = conn._id.toString();
    conn.projectId = conn.projectId.toString();
    return conn;
  });
};

/**
 * Updates a connection status to ACCEPTED or REJECTED
 */
export const updateConnectionStatus = async (connectionId, status, mentorId) => {
  connectionId = checkId(connectionId, 'Connection ID');
  mentorId = checkId(mentorId, 'Mentor ID');
  
  status = status.toUpperCase();
  if (status !== 'ACCEPTED' && status !== 'REJECTED') {
    throw new Error("Error: Status must be ACCEPTED or REJECTED");
  }

  const connectionCollection = await connections();
  
  // Ensure the connection exists and belongs to this mentor
  const connection = await connectionCollection.findOne({ _id: new ObjectId(connectionId) });
  if (!connection) throw new Error("Error: Connection not found");
  if (connection.mentorId.toString() !== mentorId) throw new Error("Error: Unauthorized to update this connection");

  const updateInfo = await connectionCollection.updateOne(
    { _id: new ObjectId(connectionId) },
    { $set: { status: status } }
  );

  if (updateInfo.modifiedCount === 0) {
    throw new Error("Error: Could not update connection status");
  }

  return { updated: true, newStatus: status };
};

/**
 * Checks if a specific student has already applied to a project
 * Returns the status if they have, or null if they haven't.
 */
export const checkConnectionStatus = async (studentId, projectId) => {
  studentId = checkId(studentId, 'Student ID');
  projectId = checkId(projectId, 'Project ID');

  const connectionCollection = await connections();
  const connection = await connectionCollection.findOne({
    studentId: new ObjectId(studentId),
    projectId: new ObjectId(projectId)
  });

  if (!connection) return { hasApplied: false };

  return {
    hasApplied: true,
    status: connection.status
  };
};
