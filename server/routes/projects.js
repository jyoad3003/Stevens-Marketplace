import { Router } from 'express';
import { createProject, getAllProjects, getProjectById, getTrendingProjects } from '../data/projects.js';

const router = Router();

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    // 1. Ensure user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "You must be logged in to create a project" });
    }

    // 2. Ensure user is a MENTOR
    if (req.session.user.role !== 'MENTOR') {
      return res.status(403).json({ error: "Only Mentors can create projects" });
    }

    const { title, description, skillsRequired, interests } = req.body;
    const ownerId = req.session.user._id;

    // 3. Create the project
    const result = await createProject(title, description, ownerId, skillsRequired || [], interests || []);
    
    res.status(201).json(result);
  } catch (e) {
    if (e.message && e.message.startsWith('Error:')) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/projects/trending
router.get('/trending', async (req, res) => {
  try {
    const trending = await getTrendingProjects();
    res.status(200).json(trending);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (e) {
    if (e.message && e.message.startsWith('Error:')) {
      res.status(404).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router;
