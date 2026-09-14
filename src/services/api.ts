import { User, WorkContext, Teammate, WorkEvent, IntegrationStatus, QueuedMessage, InterruptionEvaluation, CatchUpBrief, ExplainWhyResult, UserStatus } from '../types/index.ts';
import { demoApi } from './demoApi.ts';

const memoryStore = new Map<string, string>();
export const safeStorage = {
  getItem:(key:string)=>{try{return typeof window!=='undefined'&&window.localStorage?window.localStorage.getItem(key):memoryStore.get(key)??null;}catch{return memoryStore.get(key)??null;}},
  setItem:(key:string,value:string)=>{try{if(typeof window!=='undefined'&&window.localStorage)window.localStorage.setItem(key,value);}catch{}memoryStore.set(key,value);},
  removeItem:(key:string)=>{try{if(typeof window!=='undefined'&&window.localStorage)window.localStorage.removeItem(key);}catch{}memoryStore.delete(key);},
};
const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const getHeaders=()=>({'Content-Type':'application/json','x-user-id':safeStorage.getItem('omniwork_user_id')||'user-me'});
async function request<T>(path:string,init:RequestInit={},fallback:()=>Promise<T>):Promise<T>{
  try{const res=await fetch(`${API_BASE}${path}`,{...init,headers:{...getHeaders(),...(init.headers||{})}});if(!res.ok)throw new Error(`API ${res.status}`);return await res.json();}catch(error){if(import.meta.env.DEV)console.warn(`[OmniWork] API unavailable for ${path}; using local demo mode.`,error);return fallback();}
}
export const api={
 loginDemo:()=>request('/api/auth/demo',{method:'POST'},demoApi.loginDemo),
 resetDemo:()=>request('/api/auth/reset-demo',{method:'POST'},demoApi.resetDemo),
 login:(email:string)=>request('/api/auth/login',{method:'POST',body:JSON.stringify({email})},()=>demoApi.login(email)),
 register:(name:string,email:string,role:string,skills:string[])=>request('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,role,skills})},()=>demoApi.register(name,email,role,skills)),
 getMe:()=>request('/api/auth/me',{},demoApi.getMe),
 updateProfile:(updates:{name?:string;role?:string;avatar_url?:string;skills?:string[]})=>request('/api/auth/profile',{method:'PUT',body:JSON.stringify(updates)},()=>demoApi.updateProfile(updates)),
 updateStatus:(params:{status:UserStatus;project?:string;task?:string;message?:string;interrupt_for?:string;expires_at?:string|null})=>request('/api/status/update',{method:'POST',body:JSON.stringify(params)},()=>demoApi.updateStatus(params)),
 returnToAvailable:()=>request('/api/status/return-available',{method:'POST'},demoApi.returnToAvailable),
 getTeam:()=>request<{team:Teammate[]}>('/api/team',{},demoApi.getTeam),
 getTeamPulse:()=>request('/api/team/pulse',{},demoApi.getTeamPulse),
 structureContext:(input:string)=>request('/api/structure-context',{method:'POST',body:JSON.stringify({input})},()=>demoApi.structureContext(input)),
 generateStatusMessage:(input:string,tone?:string)=>request('/api/generate-status-message',{method:'POST',body:JSON.stringify({input,tone})},()=>demoApi.generateStatusMessage(input)),
 checkInterruption:(params:any)=>request<InterruptionEvaluation>('/api/check-interruption',{method:'POST',body:JSON.stringify(params)},()=>demoApi.checkInterruption(params)),
 generateMessage:(params:any)=>request('/api/generate-message',{method:'POST',body:JSON.stringify(params)},()=>demoApi.generateMessage(params)),
 askOmni:(question:string)=>request('/api/ask-omni',{method:'POST',body:JSON.stringify({question})},()=>demoApi.askOmni(question)),
 getTeamRecommendations:(skillOrTopic:string)=>request('/api/team-recommendation',{method:'POST',body:JSON.stringify({skillOrTopic})},()=>demoApi.getTeamRecommendations(skillOrTopic)),
 getEvents:()=>request<{events:WorkEvent[]}>('/api/events',{},demoApi.getEvents),
 getCatchUpBrief:()=>request<CatchUpBrief>('/api/events/brief',{},demoApi.getCatchUpBrief),
 explainWhy:(eventTitle:string,eventDetail?:string)=>request<ExplainWhyResult>('/api/events/explain-why',{method:'POST',body:JSON.stringify({eventTitle,eventDetail})},()=>demoApi.explainWhy(eventTitle)),
 getIntegrations:()=>request<{integrations:IntegrationStatus[]}>('/api/integrations',{},demoApi.getIntegrations),
 toggleIntegration:(id:string)=>request('/api/integrations/'+encodeURIComponent(id)+'/toggle',{method:'POST'},()=>demoApi.toggleIntegration(id)),
 getMessages:()=>request<{messages:QueuedMessage[];unreadCount:number}>('/api/messages',{},demoApi.getMessages),
 sendMessage:(params:{recipient_id:string;urgency:'Quick question'|'Important'|'Urgent';body:string})=>request('/api/messages/send',{method:'POST',body:JSON.stringify(params)},()=>demoApi.sendMessage(params)),
 markMessagesRead:()=>request('/api/messages/mark-read',{method:'POST'},demoApi.markMessagesRead),
};
