import { Router } from 'express';
import { db } from '../db.ts';
const router = Router();
router.get('/me', async (req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';const context=await db.getWorkContext(userId);if(!context)return res.status(404).json({error:'Context not found'});res.json({workContext:context});});
router.post('/update', async (req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';const {status,project,task,message,interrupt_for,expires_at}=req.body;if(!status||!['Focus','Available','Away'].includes(status))return res.status(400).json({error:'Valid status ("Focus", "Available", "Away") is required'});const updated=await db.updateWorkContext(userId,{status,project:project!==undefined?project:'',task:task!==undefined?task:'',message:message!==undefined?message:'',interrupt_for:interrupt_for!==undefined?interrupt_for:'',expires_at:expires_at!==undefined?expires_at:null});res.json({success:true,workContext:updated,message:`Status updated to ${status}`});});
router.post('/return-available', async (req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';const updated=await db.updateWorkContext(userId,{status:'Available',message:'Free for a quick discussion or questions.',interrupt_for:'Any questions or collaboration',expires_at:null});res.json({success:true,workContext:updated,message:'Returned to Available status'});});
router.get('/history',async(req,res)=>{const userId=req.query.userId as string|undefined;res.json({history:await db.getStatusHistory(userId)});});
export default router;
