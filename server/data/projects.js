import { projects } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

// Helper for string validation
const checkString = (strVal, varName) => {
  if (!strVal) throw new Error(`Error: You must supply a ${varName}!`);
  if (typeof strVal !== 'string') throw new Error(`Error: ${varName} must be a string!`);
  strVal = strVal.trim();
  if (strVal.length === 0) throw new Error(`Error: ${varName} cannot be an empty string!`);
  return strVal;
};

/**
 * Creates a new project in the database.
 * Only MENTORs should be able to do this.
 */
export const createProject = async (title, description, ownerId, skillsRequired, interests) => {
  // 1. Validate inputs
  title = checkString(title, 'Title');
  description = checkString(description, 'Description');
  
  if (!ownerId || !ObjectId.isValid(ownerId)) {
    throw new Error('Error: Invalid owner ID');
  }

  if (!Array.isArray(skillsRequired)) throw new Error('Error: Skills must be an array');
  if (!Array.isArray(interests)) throw new Error('Error: Interests must be an array');

  const cleanSkills = skillsRequired.map(s => s.trim()).filter(s => s.length > 0);
  const cleanInterests = interests.map(i => i.trim()).filter(i => i.length > 0);

  // 2. Build the project object
  // CS 546 BRIDGE: Just like Lab 6 (Reviews/Movies), we store the owner's ID 
  // so we know who created it.
  const newProject = {
    title: title,
    description: description,
    ownerId: new ObjectId(ownerId),
    skillsRequired: cleanSkills,
    interests: cleanInterests,
    status: 'OPEN', // Could be OPEN, IN_PROGRESS, COMPLETED
    createdAt: new Date().toISOString()
  };

  const projectCollection = await projects();
  const insertInfo = await projectCollection.insertOne(newProject);
  
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('Error: Could not add project');
  }

  return { insertedProject: true, id: insertInfo.insertedId.toString() };
};

/**
 * Gets all projects (We will use this in Slice 5)
 */
export const getAllProjects = async () => {
  const projectCollection = await projects();
  const projectList = await projectCollection.find({}).toArray();
  
  // Convert ObjectIds to strings for React
  return projectList.map(project => {
    project._id = project._id.toString();
    project.ownerId = project.ownerId.toString();
    return project;
  });
};

/**
 * Gets a single project by ID, and includes the owner's details AND the accepted team members.
 */
export const getProjectById = async (id) => {
  if (!id || !ObjectId.isValid(id)) throw new Error('Error: Invalid project ID');

  const projectCollection = await projects();
  
  // We use MongoDB aggregation to do multiple joins:
  // 1. Join with 'users' to get the Mentor (owner)
  // 2. Join with 'connections' to find all students who applied
  // 3. Filter connections to only those that are 'ACCEPTED'
  // 4. Join the accepted connections back to 'users' to get the student's names
  const projectList = await projectCollection.aggregate([
    { $match: { _id: new ObjectId(id) } },
    
    // Join Mentor
    {
      $lookup: {
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'owner'
      }
    },

    // Join Connections
    {
      $lookup: {
        from: 'connections',
        let: { projectId: '$_id' },
        pipeline: [
          { $match: 
            { $expr: 
              { $and: [
                { $eq: ['$projectId', '$$projectId'] },
                { $eq: ['$status', 'ACCEPTED'] }
              ]}
            }
          },
          // For each accepted connection, look up the Student's details
          {
            $lookup: {
              from: 'users',
              localField: 'studentId',
              foreignField: '_id',
              as: 'studentInfo'
            }
          },
          { $unwind: '$studentInfo' },
          {
            $project: {
              _id: 1,
              studentId: 1,
              firstName: '$studentInfo.firstName',
              lastName: '$studentInfo.lastName',
              email: '$studentInfo.email'
            }
          }
        ],
        as: 'team'
      }
    }
  ]).toArray();

  if (!projectList || projectList.length === 0) {
    throw new Error('Error: Project not found');
  }

  const project = projectList[0];
  
  // Format ObjectIds to strings
  project._id = project._id.toString();
  project.ownerId = project.ownerId.toString();
  
  if (project.owner && project.owner.length > 0) {
    const ownerData = project.owner[0];
    project.owner = {
      _id: ownerData._id.toString(),
      firstName: ownerData.firstName,
      lastName: ownerData.lastName,
      email: ownerData.email,
      role: ownerData.role
    };
  } else {
    project.owner = null;
  }

  // Format team ObjectIds
  if (project.team) {
    project.team = project.team.map(member => ({
      ...member,
      _id: member._id.toString(),
      studentId: member.studentId.toString()
    }));
  }

  return project;
};

/**
 * Gets the top 3 trending projects based on application count.
 * Used for the Landing Page teaser.
 */
export const getTrendingProjects = async () => {
  const projectCollection = await projects();
  
  // Aggregate: Join connections, count them, sort by count, limit 3
  const trendingList = await projectCollection.aggregate([
    { $match: { status: 'OPEN' } },
    {
      $lookup: {
        from: 'connections',
        localField: '_id',
        foreignField: 'projectId',
        as: 'applications'
      }
    },
    {
      $addFields: {
        applicantCount: { $size: '$applications' }
      }
    },
    { $sort: { applicantCount: -1, createdAt: -1 } },
    { $limit: 3 },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        skillsRequired: 1,
        applicantCount: 1
      }
    }
  ]).toArray();

  return trendingList.map(p => {
    p._id = p._id.toString();
    return p;
  });
};
