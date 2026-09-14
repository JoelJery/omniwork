import { Router } from 'express';
import { db } from '../db.ts';
import { generateTeamPulse } from '../ai/gemini.ts';
const router=Router();
router.get('/',async(_req,res)=>{const users=await db.getUsers();const contexts=await db.getAllWorkContexts();const team=users.map(user=>({...user,workContext:contexts[user.id]||{id:`ctx-${user.id}`,user_id:user.id,status:'Available',project:'',task:'',message:'Available',interrupt_for:'Open for questions',expires_at:null,created_at:'',updated_at:''}}));res.json({team});});
router.get('/pulse',async(_req,res)=>{const users=await db.getUsers();const contexts=await db.getAllWorkContexts();const teamData=users.map(u=>{const ctx=contexts[u.id];return{name:u.name,status:ctx?.status||'Available',task:ctx?.task||ctx?.project||'',expires_at:ctx?.expires_at||null};});res.json(await generateTeamPulse(teamData));});
router.get('/:id',async(req,res)=>{const user=await db.getUser(req.params.id);if(!user)return res.status(404).json({error:'Teammate not found'});res.json({user,workContext:await db.getWorkContext(user.id)});});
export default router;
