import { Router } from 'express';
import { db } from '../db.ts';
const router=Router();
router.get('/',async(req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';const messages=await db.getQueuedMessages(userId);res.json({messages,unreadCount:messages.filter(m=>!m.read).length});});
router.post('/send',async(req,res)=>{const senderId=(req.headers['x-user-id'] as string)||'user-me';const sender=(await db.getUser(senderId))||(await db.getUser('user-me'));if(!sender)return res.status(404).json({error:'Sender not found'});const {recipient_id,urgency,body}=req.body;if(!recipient_id||!body)return res.status(400).json({error:'recipient_id and body are required'});const recipient=await db.getUser(recipient_id);if(!recipient)return res.status(404).json({error:'Recipient not found'});const newMsg=await db.addQueuedMessage({sender_id:sender.id,sender_name:sender.name,sender_avatar:sender.avatar_url,recipient_id:recipient.id,recipient_name:recipient.name,urgency:urgency||'Quick question',body});res.json({success:true,message:`Message queued respectfully for ${recipient.name}. They will be notified according to their boundaries.`,sent:newMsg});});
router.post('/mark-read',async(req,res)=>{const userId=(req.headers['x-user-id'] as string)||'user-me';await db.markMessagesRead(userId);res.json({success:true});});
export default router;
