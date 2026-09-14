import { Router } from 'express';
import { db } from '../db.ts';
import { generateCatchUpBrief, explainWhy } from '../ai/gemini.ts';
const router=Router();
router.get('/',async(_req,res)=>res.json({events:await db.getWorkEvents()}));
router.post('/',async(req,res)=>{const {team_id,source,category,title,detail,project,target_user,action_required,time_display}=req.body;if(!source||!category||!title)return res.status(400).json({error:'Source, category, and title are required'});const event=await db.addWorkEvent({team_id:team_id||'team-omni',source,category,title,detail:detail||'',project:project||'General',target_user,action_required:Boolean(action_required),time_display:time_display||'Just now'});res.json({success:true,event});});
router.get('/brief',async(req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';const context=await db.getWorkContext(userId);res.json(await generateCatchUpBrief(await db.getWorkEvents(),context?.project));});
router.post('/explain-why',async(req,res)=>{const {eventTitle}=req.body;if(!eventTitle)return res.status(400).json({error:'eventTitle is required'});res.json(await explainWhy(eventTitle,await db.getWorkEvents()));});
export default router;
