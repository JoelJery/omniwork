import { Router } from 'express';
import { db } from '../db.ts';
const router=Router();
router.get('/',async(req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';res.json({integrations:await db.getIntegrations(userId)});});
router.post('/:id/toggle',async(req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';res.json({success:true,integrations:await db.toggleIntegration(userId,req.params.id)});});
export default router;
