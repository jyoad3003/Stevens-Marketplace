import { closeConnection, dbConnection } from '../config/mongoConnection.js';
import { users, projects, connections } from '../config/mongoCollections.js';
import { createUser, updateUserProfile } from '../data/users.js';
import { createProject } from '../data/projects.js';
import { applyToProject } from '../data/connections.js';
import dotenv from 'dotenv';
dotenv.config();

const main = async () => {
  console.log('Starting seed process...');
  const db = await dbConnection();
  
  const usersCollection = await users();
  const projectsCollection = await projects();
  const connectionsCollection = await connections();

  console.log('Clearing old data...');
  await usersCollection.deleteMany({});
  await projectsCollection.deleteMany({});
  await connectionsCollection.deleteMany({});

  try {
    console.log('Creating Mentor 1 (Prof. Lippizzi)...');
    const mentor1 = await createUser('Carlo', 'Lippizzi', 'clippizz@stevens.edu', 'Password123!', 'MENTOR');
    await updateUserProfile(mentor1.id, 'MENTOR', {
      title: 'Professor of Computer Science',
      bio: 'I run the Stevens AI Research Lab focusing on Natural Language Processing and network dynamics.'
    });

    console.log('Creating Mentor 2 (Dr. Turing)...');
    const mentor2 = await createUser('Alan', 'Turing', 'aturing@stevens.edu', 'Password123!', 'MENTOR');
    await updateUserProfile(mentor2.id, 'MENTOR', {
      title: 'Director of the Data Science Lab',
      bio: 'Focusing on algorithmic efficiency and machine learning applications in modern web environments.'
    });

    console.log('Creating Student 1 (Jane)...');
    const student1 = await createUser('Jane', 'Doe', 'jdoe1@stevens.edu', 'Password123!', 'STUDENT');
    await updateUserProfile(student1.id, 'STUDENT', {
      major: 'M.S. Computer Science',
      graduationYear: '2025',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      interests: ['Web Development', 'Startups', 'UI/UX'],
      bio: 'Full stack developer looking for a capstone project.',
      portfolioLink: 'https://github.com/janedoe'
    });

    console.log('Creating Student 2 (John)...');
    const student2 = await createUser('John', 'Smith', 'jsmith2@stevens.edu', 'Password123!', 'STUDENT');
    await updateUserProfile(student2.id, 'STUDENT', {
      major: 'M.S. Data Science',
      graduationYear: '2026',
      skills: ['Python', 'TensorFlow', 'SQL', 'Machine Learning'],
      interests: ['AI', 'Data Analysis', 'Research'],
      bio: 'Data science enthusiast looking for academic research opportunities.',
      portfolioLink: 'https://github.com/johnsmith'
    });

    console.log('Creating Student 3 (Alex)...');
    const student3 = await createUser('Alex', 'Johnson', 'ajohnson@stevens.edu', 'Password123!', 'STUDENT');
    await updateUserProfile(student3.id, 'STUDENT', {
      major: 'B.S. Software Engineering',
      graduationYear: '2025',
      skills: ['Java', 'C++', 'AWS', 'Docker'],
      interests: ['Backend', 'Cloud Computing', 'Infrastructure'],
      bio: 'Backend engineer looking to build scalable systems.',
      portfolioLink: 'https://github.com/alexj'
    });

    console.log('Creating Projects...');
    const p1 = await createProject(
      'AI-Powered Resume Matcher',
      'We are building a tool that uses NLP to match student resumes with job descriptions. Need a full-stack dev and an ML expert.',
      mentor1.id,
      ['Python', 'React', 'Machine Learning', 'Node.js'],
      ['AI', 'Web Development', 'Research']
    );

    const p2 = await createProject(
      'Scalable Web Analytics Dashboard',
      'Looking for a team to build a high-performance analytics dashboard for tracking web traffic in real-time.',
      mentor2.id,
      ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
      ['Web Development', 'Cloud Computing', 'Startups']
    );

    const p3 = await createProject(
      'Financial Market Predictor',
      'Research project analyzing stock market trends using deep learning models.',
      mentor1.id,
      ['Python', 'TensorFlow', 'Data Analysis'],
      ['AI', 'Finance', 'Research']
    );

    console.log('Creating Connections (Applications)...');
    // Jane applies to Web Analytics (p2)
    await applyToProject(student1.id, p2.id, 'I have extensive experience with React and Node and would love to build this dashboard.');
    
    // John applies to Financial Predictor (p3)
    await applyToProject(student2.id, p3.id, 'I am a Data Science major with heavy TensorFlow experience. This is a perfect fit.');

    // Alex applies to Web Analytics (p2)
    await applyToProject(student3.id, p2.id, 'I can handle the AWS and Docker deployment for the dashboard.');

    // Jane applies to Resume Matcher (p1)
    await applyToProject(student1.id, p1.id, 'I can build the React frontend for the AI matcher.');

    console.log('Done seeding data!');
  } catch (e) {
    console.error('Seeding error (this is fine if you already ran it once):', e.message);
  }

  await closeConnection();
  console.log('Database connection closed.');
};

main().catch(console.error);
