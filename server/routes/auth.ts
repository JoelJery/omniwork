import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

router.post('/demo', async (_req, res) => {
  const user = (await db.getUser('user-me')) || (await db.getUsers())[0];
  if (!user) return res.status(404).json({ error: 'Demo user not found' });
  const context = await db.getWorkContext(user.id);
  res.json({ success: true, user, workContext: context, token: 'demo-session-token' });
});

router.post('/reset-demo', async (_req, res) => {
  await db.resetDemoData();
  const user = await db.getUser('user-me');
  const context = await db.getWorkContext(user?.id || 'user-me');
  res.json({ success: true, message: 'Demo state reset successfully', user, workContext: context });
});

router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = await db.getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found. Use "Try Demo" or register an account.' });
  const context = await db.getWorkContext(user.id);
  res.json({ success: true, user, workContext: context, token: `token-${user.id}` });
});

router.post('/register', async (req, res) => {
  const { name, email, role, skills } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  if (await db.getUserByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists' });
  const newUser = await db.createUser({
    id: `user-${Date.now()}`, name, email, role: role || 'Team Member',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    skills: Array.isArray(skills) ? skills : ['Collaboration'], created_at: new Date().toISOString(),
  });
  const context = await db.getWorkContext(newUser.id);
  res.json({ success: true, user: newUser, workContext: context, token: `token-${newUser.id}` });
});

router.get('/me', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const user = (await db.getUser(userId)) || (await db.getUser('user-me'));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const context = await db.getWorkContext(user.id);
  res.json({ user, workContext: context });
});

router.put('/profile', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const user = (await db.getUser(userId)) || (await db.getUser('user-me'));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, role, avatar_url, skills } = req.body;
  const updates: Partial<typeof user> = {};
  if (typeof name === 'string' && name.trim()) updates.name = name.trim();
  if (typeof role === 'string' && role.trim()) updates.role = role.trim();
  if (typeof avatar_url === 'string' && avatar_url.trim()) updates.avatar_url = avatar_url.trim();
  if (Array.isArray(skills)) updates.skills = skills;
  const updatedUser = await db.updateUser(user.id, updates);
  const context = await db.getWorkContext(user.id);
  res.json({ success: true, user: updatedUser, workContext: context, message: 'Profile updated successfully' });
});

export default router;
