import { Router } from 'express';
import { createUser, checkUser, updateUserProfile } from '../data/users.js';
import xss from 'xss';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // 1. Clean inputs with XSS (CS 546 Lab 10 requirement)
    const firstName = xss(req.body.firstName);
    const lastName = xss(req.body.lastName);
    const email = xss(req.body.email);
    const password = xss(req.body.password);
    const role = xss(req.body.role);

    // 2. Call our data function
    const result = await createUser(firstName, lastName, email, password, role);
    
    // 3. Respond with success
    res.status(201).json(result);
  } catch (e) {
    // If it starts with "Error:", it's a validation error we threw
    if (e.message && e.message.startsWith('Error:')) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = xss(req.body.email);
    const password = xss(req.body.password);

    // 1. Check user credentials
    const user = await checkUser(email, password);

    // 2. Create the session (just like Lab 10)
    req.session.user = user;

    // 3. Respond with the user object (React will use this to update the UI)
    res.status(200).json(user);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logged out successfully" });
});

// GET /api/auth/me
// React uses this when it first loads to check: "Am I already logged in?"
router.get('/me', async (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    // 1. Ensure user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "You must be logged in to update your profile" });
    }

    const { _id, role } = req.session.user;
    
    // 2. Call data function to update MongoDB
    // req.body now contains the full profileData object sent from the frontend
    const updatedUser = await updateUserProfile(_id, role, req.body);

    // 3. Update the session so the new fields persist
    req.session.user = updatedUser;

    // 4. Send back to React
    res.status(200).json(updatedUser);
  } catch (e) {
    if (e.message && e.message.startsWith('Error:')) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router;
