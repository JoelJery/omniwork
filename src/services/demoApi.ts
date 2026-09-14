import { User, WorkContext, WorkEvent, IntegrationStatus, QueuedMessage, UserStatus, InterruptionEvaluation, CatchUpBrief, ExplainWhyResult } from '../types/index.ts';

export interface DemoState {
  users: User[];
  workContexts: Record<string, WorkContext>;
  statusHistory: Array<{id:string;user_id:string;status:UserStatus;message:string;created_at:string}>;
  workEvents: WorkEvent[];
  integrations: Record<string, IntegrationStatus[]>;
  queuedMessages: QueuedMessage[];
}

const STORAGE_KEY='omniwork_demo_state_v1';
const SEED: DemoState = {
  "users": [
    {
      "id": "user-me",
      "name": "You (Joel Jery)",
      "email": "joel.jery@omniwork.internal",
      "role": "Lead Full-Stack Engineer",
      "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "API Design"
      ],
      "created_at": "2026-08-15T17:54:02.011Z"
    },
    {
      "id": "user-rahul",
      "name": "Rahul Sharma",
      "email": "rahul.s@omniwork.internal",
      "role": "Staff Backend Engineer",
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "Node.js",
        "PostgreSQL",
        "Stripe",
        "Redis",
        "Webhooks",
        "Distributed Systems"
      ],
      "created_at": "2026-07-16T17:54:02.012Z"
    },
    {
      "id": "user-sarah",
      "name": "Sarah Lin",
      "email": "sarah.lin@omniwork.internal",
      "role": "Senior Frontend Lead",
      "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Design Systems",
        "Product UX",
        "Web Performance"
      ],
      "created_at": "2026-06-16T17:54:02.012Z"
    },
    {
      "id": "user-alex-rivera",
      "name": "Alex Rivera",
      "email": "alex.r@omniwork.internal",
      "role": "QA Automation Engineer",
      "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "Cypress",
        "Playwright",
        "CI/CD",
        "Regression Testing",
        "Postman"
      ],
      "created_at": "2026-07-31T17:54:02.012Z"
    },
    {
      "id": "user-priya",
      "name": "Priya Patel",
      "email": "priya.p@omniwork.internal",
      "role": "Lead Product Designer",
      "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "Figma",
        "UI/UX",
        "Design Systems",
        "User Research",
        "Prototyping"
      ],
      "created_at": "2026-07-01T17:54:02.012Z"
    },
    {
      "id": "user-marcus",
      "name": "Marcus Chen",
      "email": "marcus.c@omniwork.internal",
      "role": "DevOps & Infra Architect",
      "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      "skills": [
        "Kubernetes",
        "Docker",
        "AWS",
        "GCP",
        "PostgreSQL",
        "Terraform"
      ],
      "created_at": "2026-05-17T17:54:02.012Z"
    }
  ],
  "workContexts": {
    "user-me": {
      "id": "ctx-me",
      "user_id": "user-me",
      "status": "Focus",
      "project": "OmniWork Core",
      "task": "Workspace context & interruptibility features",
      "message": "Working on OmniWork Core \u2014 please avoid interruptions.",
      "interrupt_for": "Critical blockers & production outages",
      "expires_at": "1h",
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T19:14:42.320Z"
    },
    "user-rahul": {
      "id": "ctx-rahul",
      "user_id": "user-rahul",
      "status": "Focus",
      "project": "Checkout 2.0",
      "task": "Webhook retry handling & payment idempotency",
      "message": "Working on webhook retry handling \u2014 please avoid interruptions.",
      "interrupt_for": "Production outages & critical blockers",
      "expires_at": "3:30 PM",
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T17:54:02.012Z"
    },
    "user-sarah": {
      "id": "ctx-sarah",
      "user_id": "user-sarah",
      "status": "Available",
      "project": "Checkout 2.0",
      "task": "Reviewing component library & design polish",
      "message": "Free for a quick discussion or frontend code reviews.",
      "interrupt_for": "Any frontend or design questions",
      "expires_at": null,
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T17:54:02.012Z"
    },
    "user-alex-rivera": {
      "id": "ctx-alex-rivera",
      "user_id": "user-alex-rivera",
      "status": "Focus",
      "project": "Checkout 2.0",
      "task": "Preparing release presentation & test report",
      "message": "Preparing release presentation \u2014 heads down.",
      "interrupt_for": "Critical issues",
      "expires_at": "8:00 PM",
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T17:54:02.012Z"
    },
    "user-priya": {
      "id": "ctx-priya",
      "user_id": "user-priya",
      "status": "Away",
      "project": "Design Sprint",
      "task": "Off-site client research workshop",
      "message": "Back at 4:00 PM from client research sync.",
      "interrupt_for": "Urgent design blockers",
      "expires_at": "4:00 PM",
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T17:54:02.012Z"
    },
    "user-marcus": {
      "id": "ctx-marcus",
      "user_id": "user-marcus",
      "status": "Available",
      "project": "Infra Hardening",
      "task": "Cluster scaling & monitoring rules",
      "message": "Available for DevOps consultation or deploy approvals.",
      "interrupt_for": "Open to team syncs",
      "expires_at": null,
      "created_at": "2026-09-14T17:54:02.012Z",
      "updated_at": "2026-09-14T17:54:02.012Z"
    }
  },
  "statusHistory": [
    {
      "id": "hist-1789413282320",
      "user_id": "user-me",
      "status": "Focus",
      "message": "Working on OmniWork Core \u2014 please avoid interruptions.",
      "created_at": "2026-09-14T19:14:42.320Z"
    },
    {
      "id": "hist-1789413065869",
      "user_id": "user-me",
      "status": "Focus",
      "message": "Working on OmniWork Core \u2014 please avoid interruptions.",
      "created_at": "2026-09-14T19:11:05.869Z"
    },
    {
      "id": "hist-1789413059107",
      "user_id": "user-me",
      "status": "Available",
      "message": "Free for a quick discussion or questions.",
      "created_at": "2026-09-14T19:10:59.107Z"
    },
    {
      "id": "hist-1",
      "user_id": "user-me",
      "status": "Available",
      "message": "Free for a quick discussion or questions.",
      "created_at": "2026-09-14T15:54:02.012Z"
    }
  ],
  "workEvents": [
    {
      "id": "evt-1",
      "team_id": "team-omni",
      "source": "Slack #payments",
      "category": "BLOCKER",
      "title": "Payment webhook failures reported in staging",
      "detail": "Stripe retry alerts triggered due to unhandled duplicate events in staging environment.",
      "project": "Checkout 2.0",
      "action_required": false,
      "time_display": "10:10 AM",
      "created_at": "2026-09-14T14:54:02.012Z"
    },
    {
      "id": "evt-2",
      "team_id": "team-omni",
      "source": "Engineering Sync",
      "category": "FYI",
      "title": "Regression testing recommended by QA",
      "detail": "Alex flagged payment edge cases and requested full regression coverage before release.",
      "project": "Checkout 2.0",
      "action_required": false,
      "time_display": "11:00 AM",
      "created_at": "2026-09-14T15:44:02.012Z"
    },
    {
      "id": "evt-3",
      "team_id": "team-omni",
      "source": "Project Update",
      "category": "DECISION",
      "title": "Checkout launch moved to Monday",
      "detail": "Deployment rescheduled by 48h to complete retry validation and ensure zero checkout risk.",
      "project": "Checkout 2.0",
      "action_required": false,
      "time_display": "11:15 AM",
      "created_at": "2026-09-14T15:59:02.012Z"
    },
    {
      "id": "evt-4",
      "team_id": "team-omni",
      "source": "GitHub PR #142",
      "category": "ACTION",
      "title": "Rahul requested review of PR #142",
      "detail": "feat(payments): idempotency key caching and exponential backoff retry handler.",
      "project": "Checkout 2.0",
      "target_user": "user-me",
      "action_required": true,
      "time_display": "11:30 AM",
      "created_at": "2026-09-14T16:14:02.012Z"
    },
    {
      "id": "evt-5",
      "team_id": "team-omni",
      "source": "Linear",
      "category": "ACTION",
      "title": "Update payment fallback documentation",
      "detail": "Document retry thresholds and incident playbook for customer operations team.",
      "project": "Checkout 2.0",
      "target_user": "user-me",
      "action_required": true,
      "time_display": "11:45 AM",
      "created_at": "2026-09-14T16:29:02.012Z"
    },
    {
      "id": "evt-6",
      "team_id": "team-omni",
      "source": "Figma #checkout",
      "category": "FYI",
      "title": "New empty states finalized for payment errors",
      "detail": "Priya updated component specifications in the design system token file.",
      "project": "Checkout 2.0",
      "action_required": false,
      "time_display": "12:05 PM",
      "created_at": "2026-09-14T16:49:02.012Z"
    }
  ],
  "integrations": {
    "user-me": [
      {
        "id": "slack",
        "name": "Slack",
        "icon": "slack",
        "connected": true,
        "lastSyncedStatus": "Focus \u2014 Working on OmniWork Core",
        "lastSyncedAt": "Just now"
      },
      {
        "id": "github",
        "name": "GitHub",
        "icon": "github",
        "connected": true,
        "lastSyncedStatus": "Synced active PR status",
        "lastSyncedAt": "5m ago"
      },
      {
        "id": "zoom",
        "name": "Zoom",
        "icon": "video",
        "connected": true,
        "lastSyncedStatus": "Calendar presence auto-synced",
        "lastSyncedAt": "12m ago"
      },
      {
        "id": "workspace",
        "name": "Project Workspace",
        "icon": "folder",
        "connected": true,
        "lastSyncedStatus": "Context: Checkout 2.0",
        "lastSyncedAt": "3m ago"
      },
      {
        "id": "notes",
        "name": "Meeting Notes",
        "icon": "file-text",
        "connected": true,
        "lastSyncedStatus": "Synced 3 action items",
        "lastSyncedAt": "25m ago"
      }
    ]
  },
  "queuedMessages": [
    {
      "id": "msg-1",
      "sender_id": "user-sarah",
      "sender_name": "Sarah Lin",
      "sender_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "recipient_id": "user-me",
      "recipient_name": "You",
      "urgency": "Quick question",
      "body": "Whenever you finish your focus session, could you check the button padding in the checkout PR?",
      "created_at": "2026-09-14T17:14:02.012Z",
      "read": true
    },
    {
      "id": "msg-2",
      "sender_id": "user-marcus",
      "sender_name": "Marcus Chen",
      "sender_avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      "recipient_id": "user-me",
      "recipient_name": "You",
      "urgency": "Important",
      "body": "Staging PostgreSQL cluster will be restarted at 6 PM for maintenance (no downtime expected).",
      "created_at": "2026-09-14T17:29:02.012Z",
      "read": true
    },
    {
      "id": "msg-3",
      "sender_id": "user-priya",
      "sender_name": "Priya Patel",
      "sender_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      "recipient_id": "user-me",
      "recipient_name": "You",
      "urgency": "Quick question",
      "body": "Shared the mobile checkout flow export in Figma whenever you take a break.",
      "created_at": "2026-09-14T17:44:02.012Z",
      "read": true
    }
  ]
} as DemoState;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));

function load(): DemoState {
  try { const raw=localStorage.getItem(STORAGE_KEY); if(raw) return JSON.parse(raw); } catch {}
  const state=clone(SEED); try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{} return state;
}
function save(state:DemoState){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}}
function ctxFor(state:DemoState,id:string):WorkContext {
  return state.workContexts[id] || {id:`ctx-${id}`,user_id:id,status:'Available',project:'General',task:'Open for collaboration',message:'Available for questions or quick syncs.',interrupt_for:'Any questions or collaboration',expires_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
}
function currentUser(state:DemoState,id?:string){return state.users.find(u=>u.id===(id||'user-me')) || state.users[0];}

export const demoApi = {
  loginDemo: async()=>{const s=load();const user=currentUser(s,'user-me')!;return {user,workContext:ctxFor(s,user.id),token:'demo-session-token'};},
  resetDemo: async()=>{const s=clone(SEED);save(s);const user=currentUser(s,'user-me')!;return {user,workContext:ctxFor(s,user.id)};},
  login: async(email:string)=>{const s=load();const user=s.users.find(u=>u.email.toLowerCase()===email.toLowerCase());if(!user)throw new Error('User not found. Use "Try Demo" or register an account.');return {user,workContext:ctxFor(s,user.id),token:`token-${user.id}`};},
  register: async(name:string,email:string,role:string,skills:string[])=>{const s=load();if(s.users.some(u=>u.email.toLowerCase()===email.toLowerCase()))throw new Error('An account with this email already exists');const user:User={id:`user-${Date.now()}`,name,email,role:role||'Team Member',avatar_url:`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,skills:skills?.length?skills:['Collaboration'],created_at:new Date().toISOString()};s.users.push(user);s.workContexts[user.id]=ctxFor(s,user.id);s.integrations[user.id]=clone(SEED.integrations['user-me']||[]);save(s);return {user,workContext:s.workContexts[user.id]};},
  getMe: async()=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';const user=currentUser(s,id)!;return {user,workContext:ctxFor(s,user.id)};},
  updateProfile: async(updates:Partial<User>)=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';const u=currentUser(s,id)!;Object.assign(u,updates);save(s);return {user:u,workContext:ctxFor(s,u.id)};},
  updateStatus: async(params:any)=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';const old=ctxFor(s,id);const updated={...old,...params,updated_at:new Date().toISOString(),expires_at:params.expires_at??null};delete (updated as any).until;s.workContexts[id]=updated;s.statusHistory.unshift({id:`hist-${Date.now()}`,user_id:id,status:updated.status,message:updated.message||`${updated.status} mode`,created_at:new Date().toISOString()});save(s);return {workContext:updated};},
  returnToAvailable: async()=>demoApi.updateStatus({status:'Available',message:'Free for a quick discussion or questions.',interrupt_for:'Any questions or collaboration',expires_at:null}),
  getTeam: async()=>{const s=load();return {team:s.users.map(user=>({...user,workContext:ctxFor(s,user.id)}))};},
  getTeamPulse: async()=>{const s=load();const counts={available:0,focus:0,away:0};s.users.forEach(u=>{const st=ctxFor(s,u.id).status;if(st==='Available')counts.available++;else if(st==='Focus')counts.focus++;else counts.away++;});return {counts,summary:`${counts.available} available, ${counts.focus} in focus mode, and ${counts.away} away.`};},
  structureContext: async(input:string)=>{const l=input.toLowerCase();let status:UserStatus='Focus';if(/\b(free|available|open|chat)\b/.test(l))status='Available';else if(/\b(away|lunch|stepping out|errand)\b/.test(l))status='Away';const tm=input.match(/(?:until|till|back at|at)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)||input.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);return {status,message:status==='Available'?'Free for questions or a quick discussion.':status==='Away'?'Away for a while; I will respond when I am back.':'In focus mode; please interrupt only when necessary.',project:/checkout/i.test(l)?'Checkout 2.0':/payment/i.test(l)?'Payment Flow':'',task:/frontend/i.test(l)?'Frontend implementation':'',until:tm?tm[1]:null,interrupt_for:status==='Focus'?'Critical blockers and production issues only':'Any questions or collaboration'};},
  generateStatusMessage: async(input:string)=>({allVariations:{professional:`Working on ${input}. Please reach out only if needed.`,friendly:`Heads down on ${input} — happy to connect when I’m free!`,concise:`Focused on ${input}.`}}),
  checkInterruption: async(p:any):Promise<InterruptionEvaluation>=>{const urgent=p.urgency==='Urgent';const focus=p.status==='Focus';const allowed=!focus||urgent||/critical|urgent|outage|blocked|production/i.test(`${p.userRequest} ${p.interruptPreference||''}`);return {verdict:allowed?(urgent?'APPROPRIATE TO INTERRUPT':'APPROPRIATE TO CONTACT'):'BETTER TO WAIT',reason:allowed?'The request appears appropriate for the teammate’s stated interruption boundaries.':'They are in focus mode and the request does not match their stated interruption boundaries.',status:p.status||'Focus',interruptionPreference:p.interruptPreference||'',suggestedAction:allowed?'Contact now':'Queue the message for later'} as InterruptionEvaluation;},
  generateMessage: async(p:any)=>({generatedMessage:`Hi ${p.recipientName||'there'}, ${p.rawGoal}. No rush — please reply when you’re available.`,tone:p.tone||'Friendly',isRecipientFocused:p.recipientStatus==='Focus'}),
  askOmni: async(q:string)=>{const s=load();const matches=s.users.map(u=>{const c=ctxFor(s,u.id);return `${u.name} is ${c.status}${c.project?` on ${c.project}`:''}.`}).join(' ');return {answer:`Based on the current demo workspace: ${matches}`,sources:s.users.slice(0,4).map(u=>({name:u.name,status:ctxFor(s,u.id).status,detail:ctxFor(s,u.id).message})),suggestedFollowUps:['Who is available right now?','Who can help with PostgreSQL?']};},
  getTeamRecommendations: async(q:string)=>{const s=load();const x=q.toLowerCase();const matches=s.users.map(u=>{const c=ctxFor(s,u.id);const has=u.skills.some(k=>k.toLowerCase().includes(x));const role=u.role.toLowerCase().includes(x);const avail=c.status==='Available';const score=(has?50:0)+(role?25:0)+(avail?25:0);return {user:u,status:c.status,expires_at:c.expires_at,matchScore:score,reason:has&&avail?`Expert in ${x} and currently Available.`:has?`Strong match for ${x}, but currently ${c.status}.`:avail?'Currently available.':`In ${c.status} mode.`};}).sort((a,b)=>b.matchScore-a.matchScore);return {matches};},
  getEvents: async()=>({events:load().workEvents}),
  getCatchUpBrief: async():Promise<CatchUpBrief>=>{const s=load();const events=s.workEvents.slice(0,20);return {readTimeSeconds:Math.max(15,events.length*8),headline:'Your latest OmniWork activity',blockers:events.filter(e=>e.category==='BLOCKER'),decisions:events.filter(e=>e.category==='DECISION'),actions:events.filter(e=>e.category==='ACTION'),fyis:events.filter(e=>e.category==='FYI'),summary:`${events.length} recent work events are available in your catch-up feed.`};},
  explainWhy: async(title:string):Promise<ExplainWhyResult>=>({explanation:`${title} is highlighted because it may affect the team’s current work context or require awareness.`,evidenceTimeline:load().workEvents.slice(0,3).map(e=>({time:e.time_display,source:e.source,note:e.title}))}),
  getIntegrations: async()=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';return {integrations:s.integrations[id]||SEED.integrations['user-me']||[]};},
  toggleIntegration: async(id:string)=>{const s=load();const uid=localStorage.getItem('omniwork_user_id')||'user-me';const list=s.integrations[uid]||clone(SEED.integrations['user-me']||[]);const item=list.find(x=>x.id===id);if(item){item.connected=!item.connected;item.lastSyncedAt='Just now';}s.integrations[uid]=list;save(s);return {success:true,integrations:list};},
  getMessages: async()=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';const messages=s.queuedMessages.filter(m=>m.recipient_id===id);return {messages,unreadCount:messages.filter(m=>!m.read).length};},
  sendMessage: async(p:any)=>{const s=load();const sender=currentUser(s,localStorage.getItem('omniwork_user_id')||'user-me')!;const recipient=s.users.find(u=>u.id===p.recipient_id);if(!recipient)throw new Error('Recipient not found');const msg:QueuedMessage={id:`msg-${Date.now()}`,sender_id:sender.id,sender_name:sender.name,sender_avatar:sender.avatar_url,recipient_id:recipient.id,recipient_name:recipient.name,urgency:p.urgency||'Quick question',body:p.body,created_at:new Date().toISOString(),read:false};s.queuedMessages.unshift(msg);save(s);return {success:true,message:`Message queued respectfully for ${recipient.name}. They will be notified according to their boundaries.`,sent:msg};},
  markMessagesRead: async()=>{const s=load();const id=localStorage.getItem('omniwork_user_id')||'user-me';s.queuedMessages=s.queuedMessages.map(m=>m.recipient_id===id?{...m,read:true}:m);save(s);return {success:true};},
};
