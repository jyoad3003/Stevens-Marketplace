import { Router } from 'express';
import { applyToProject, getIncomingApplications, updateConnectionStatus, checkConnectionStatus } from '../data/connections.js';

const router = Router();

// POST /api/connections/apply
router.post('/apply', async (req, res) => {
  try {
    // 1. Ensure user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "You must be logged in to apply." });
    }

    // 2. Ensure user is a STUDENT
    if (req.session.user.role !== 'STUDENT') {
      return res.status(403).json({ error: "Only Students can apply to projects." });
    }

    const { projectId, message } = req.body;
    const studentId = req.session.user._id;

    // 3. Create the connection
    const result = await applyToProject(studentId, projectId, message);
    
    res.status(201).json(result);
  } catch (e) {
    if (e.message && e.message.startsWith('Error:')) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// GET /api/connections/incoming
router.get('/incoming', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'MENTOR') {
      return res.status(403).json({ error: "Unauthorized. Only Mentors can view incoming applications." });
    }

    const mentorId = req.session.user._id;
    const applications = await getIncomingApplications(mentorId);
    
    res.status(200).json(applications);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/connections/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'MENTOR') {
      return res.status(403).json({ error: "Unauthorized. Only Mentors can update application status." });
    }

    const connectionId = req.params.id;
    const { status } = req.body;
    const mentorId = req.session.user._id;

    const result = await updateConnectionStatus(connectionId, status, mentorId);
    res.status(200).json(result);
  } catch (e) {
    if (e.message && e.message.startsWith('Error:')) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// GET /api/connections/status/:projectId
router.get('/status/:projectId', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'STUDENT') {
      return res.status(200).json({ hasApplied: false }); // Non-students haven't applied
    }

    const studentId = req.session.user._id;
    const projectId = req.params.projectId;

    const result = await checkConnectionStatus(studentId, projectId);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
