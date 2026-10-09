import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

// Helper for basic string validation (CS 546 style)
const checkString = (strVal, varName) => {
  if (!strVal) throw new Error(`Error: You must supply a ${varName}!`);
  if (typeof strVal !== 'string') throw new Error(`Error: ${varName} must be a string!`);
  strVal = strVal.trim();
  if (strVal.length === 0) throw new Error(`Error: ${varName} cannot be an empty string!`);
  return strVal;
};

/**
 * Creates a new user in the database.
 * CS 546 BRIDGE: This is identical to your Lab 10 createUser function.
 */
export const createUser = async (firstName, lastName, email, password, role) => {
  // 1. Validate inputs
  firstName = checkString(firstName, 'First Name');
  lastName = checkString(lastName, 'Last Name');
  email = checkString(email, 'Email').toLowerCase();
  password = checkString(password, 'Password');
  role = checkString(role, 'Role').toUpperCase();

  if (role !== 'STUDENT' && role !== 'MENTOR') {
    throw new Error("Error: Role must be either STUDENT or MENTOR");
  }

  const userCollection = await users();

  // 2. Check if email already exists
  const existingUser = await userCollection.findOne({ email: email });
  if (existingUser) {
    throw new Error('Error: A user with that email already exists.');
  }

  // 3. Hash the password (exactly like Lab 10)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Create the new user object
  // Notice we add empty arrays for skills/interests. This is vital for our future AI Vector search!
  let newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    hashedPassword: hashedPassword,
    role: role,
    skills: [],
    interests: [],
    createdAt: new Date().toISOString()
  };

  // 5. Insert into MongoDB
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('Error: Could not add user');
  }

  return { insertedUser: true, id: insertInfo.insertedId.toString() };
};

/**
 * Checks a user's login credentials.
 * CS 546 BRIDGE: Identical to your Lab 10 checkUser function.
 */
export const checkUser = async (email, password) => {
  email = checkString(email, 'Email').toLowerCase();
  password = checkString(password, 'Password');

  const userCollection = await users();
  const user = await userCollection.findOne({ email: email });
  
  if (!user) {
    throw new Error('Error: Invalid email or password');
  }

  const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
  
  if (!passwordsMatch) {
    throw new Error('Error: Invalid email or password');
  }

  // If we reach here, password is correct. Return the user info (without the password!)
  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    skills: user.skills || [],
    interests: user.interests || [],
    // New optional fields
    title: user.title || '',
    bio: user.bio || '',
    major: user.major || '',
    graduationYear: user.graduationYear || '',
    portfolioLink: user.portfolioLink || ''
  };
};

/**
 * Updates a user's profile based on their role.
 */
export const updateUserProfile = async (id, role, profileData) => {
  if (!id || !ObjectId.isValid(id)) throw new Error('Error: Invalid user ID');
  
  const userCollection = await users();
  let updateDoc = {};

  if (role === 'STUDENT') {
    // 1. Process Arrays
    const skills = profileData.skills || [];
    const interests = profileData.interests || [];
    if (!Array.isArray(skills)) throw new Error('Error: Skills must be an array');
    if (!Array.isArray(interests)) throw new Error('Error: Interests must be an array');
    
    updateDoc.skills = skills.map(s => s.trim()).filter(s => s.length > 0);
    updateDoc.interests = interests.map(i => i.trim()).filter(i => i.length > 0);
    
    // 2. Process Strings
    if (profileData.major) updateDoc.major = profileData.major.trim();
    if (profileData.graduationYear) updateDoc.graduationYear = profileData.graduationYear.trim();
    if (profileData.bio) updateDoc.bio = profileData.bio.trim();
    if (profileData.portfolioLink) updateDoc.portfolioLink = profileData.portfolioLink.trim();

  } else if (role === 'MENTOR') {
    // Mentors only update title and bio
    if (profileData.title) updateDoc.title = profileData.title.trim();
    if (profileData.bio) updateDoc.bio = profileData.bio.trim();
  }
  
  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' } // Returns the updated document
  );

  if (!updateInfo) {
    throw new Error('Error: Could not update user profile successfully');
  }

  // Return the updated user without the password
  return {
    _id: updateInfo._id.toString(),
    firstName: updateInfo.firstName,
    lastName: updateInfo.lastName,
    email: updateInfo.email,
    role: updateInfo.role,
    skills: updateInfo.skills || [],
    interests: updateInfo.interests || [],
    title: updateInfo.title || '',
    bio: updateInfo.bio || '',
    major: updateInfo.major || '',
    graduationYear: updateInfo.graduationYear || '',
    portfolioLink: updateInfo.portfolioLink || ''
  };
};
