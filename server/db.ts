import fs from 'node:fs';
import path from 'node:path';
import { User, WorkContext, StatusHistoryItem, WorkEvent, IntegrationStatus, QueuedMessage } from './types.ts';
import { Pool } from 'pg';

const DB_PATH = path.resolve(process.cwd(), 'omniwork-data.json');

export interface DatabaseSchema {
  users: User[];
  workContexts: Record<string, WorkContext>;
  statusHistory: StatusHistoryItem[];
  workEvents: WorkEvent[];
  integrations: Record<string, IntegrationStatus[]>;
  queuedMessages: QueuedMessage[];
}

const INITIAL_USERS: User[] = [
  {
    id: 'user-me',
    name: 'You (Joel Jery)',
    email: 'joel.jery@omniwork.internal',
    role: 'Full-Stack Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'API Design'],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.s@omniwork.internal',
    role: 'Staff Backend Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Webhooks', 'Distributed Systems'],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'user-sarah',
    name: 'Sarah Lin',
    email: 'sarah.lin@omniwork.internal',
    role: 'Senior Frontend Lead',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems', 'Product UX', 'Web Performance'],
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'user-alex-rivera',
    name: 'Alex Rivera',
    email: 'alex.r@omniwork.internal',
    role: 'QA Automation Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Cypress', 'Playwright', 'CI/CD', 'Regression Testing', 'Postman'],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.p@omniwork.internal',
    role: 'Lead Product Designer',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping'],
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    email: 'marcus.c@omniwork.internal',
    role: 'DevOps & Infra Architect',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: ['Kubernetes', 'Docker', 'AWS', 'GCP', 'PostgreSQL', 'Terraform'],
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
];

const INITIAL_WORK_CONTEXTS: Record<string, WorkContext> = {
  'user-me': {
    id: 'ctx-me',
    user_id: 'user-me',
    status: 'Available',
    project: 'OmniWork Core',
    task: 'Workspace context & interruptibility features',
    message: 'Free for a quick discussion or questions.',
    interrupt_for: 'Any questions, collaboration or code reviews',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-rahul': {
    id: 'ctx-rahul',
    user_id: 'user-rahul',
    status: 'Focus',
    project: 'Checkout 2.0',
    task: 'Webhook retry handling & payment idempotency',
    message: 'Working on webhook retry handling — please avoid interruptions.',
    interrupt_for: 'Production outages & critical blockers',
    expires_at: '3:30 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-sarah': {
    id: 'ctx-sarah',
    user_id: 'user-sarah',
    status: 'Available',
    project: 'Checkout 2.0',
    task: 'Reviewing component library & design polish',
    message: 'Free for a quick discussion or frontend code reviews.',
    interrupt_for: 'Any frontend or design questions',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-alex-rivera': {
    id: 'ctx-alex-rivera',
    user_id: 'user-alex-rivera',
    status: 'Focus',
    project: 'Checkout 2.0',
    task: 'Preparing release presentation & test report',
    message: 'Preparing release presentation — heads down.',
    interrupt_for: 'Critical issues',
    expires_at: '8:00 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-priya': {
    id: 'ctx-priya',
    user_id: 'user-priya',
    status: 'Away',
    project: 'Design Sprint',
    task: 'Off-site client research workshop',
    message: 'Back at 4:00 PM from client research sync.',
    interrupt_for: 'Urgent design blockers',
    expires_at: '4:00 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-marcus': {
    id: 'ctx-marcus',
    user_id: 'user-marcus',
    status: 'Available',
    project: 'Infra Hardening',
    task: 'Cluster scaling & monitoring rules',
    message: 'Available for DevOps consultation or deploy approvals.',
    interrupt_for: 'Open to team syncs',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const INITIAL_WORK_EVENTS: WorkEvent[] = [
  {
    id: 'evt-1',
    team_id: 'team-omni',
    source: 'Slack #payments',
    category: 'BLOCKER',
    title: 'Payment webhook failures reported in staging',
    detail: 'Stripe retry alerts triggered due to unhandled duplicate events in staging environment.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '10:10 AM',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'evt-2',
    team_id: 'team-omni',
    source: 'Engineering Sync',
    category: 'FYI',
    title: 'Regression testing recommended by QA',
    detail: 'Alex flagged payment edge cases and requested full regression coverage before release.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '11:00 AM',
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
  },
  {
    id: 'evt-3',
    team_id: 'team-omni',
    source: 'Project Update',
    category: 'DECISION',
    title: 'Checkout launch moved to Monday',
    detail: 'Deployment rescheduled by 48h to complete retry validation and ensure zero checkout risk.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '11:15 AM',
    created_at: new Date(Date.now() - 115 * 60000).toISOString(),
  },
  {
    id: 'evt-4',
    team_id: 'team-omni',
    source: 'GitHub PR #142',
    category: 'ACTION',
    title: 'Rahul requested review of PR #142',
    detail: 'feat(payments): idempotency key caching and exponential backoff retry handler.',
    project: 'Checkout 2.0',
    target_user: 'user-me',
    action_required: true,
    time_display: '11:30 AM',
    created_at: new Date(Date.now() - 100 * 60000).toISOString(),
  },
  {
    id: 'evt-5',
    team_id: 'team-omni',
    source: 'Linear',
    category: 'ACTION',
    title: 'Update payment fallback documentation',
    detail: 'Document retry thresholds and incident playbook for customer operations team.',
    project: 'Checkout 2.0',
    target_user: 'user-me',
    action_required: true,
    time_display: '11:45 AM',
    created_at: new Date(Date.now() - 85 * 60000).toISOString(),
  },
  {
    id: 'evt-6',
    team_id: 'team-omni',
    source: 'Figma #checkout',
    category: 'FYI',
    title: 'New empty states finalized for payment errors',
    detail: 'Priya updated component specifications in the design system token file.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '12:05 PM',
    created_at: new Date(Date.now() - 65 * 60000).toISOString(),
  },
];

const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  { id: 'slack', name: 'Slack', icon: 'slack', connected: true, lastSyncedStatus: 'Available — Free for a quick discussion', lastSyncedAt: 'Just now' },
  { id: 'github', name: 'GitHub', icon: 'github', connected: true, lastSyncedStatus: 'Synced active PR status', lastSyncedAt: '5m ago' },
  { id: 'zoom', name: 'Zoom', icon: 'video', connected: true, lastSyncedStatus: 'Calendar presence auto-synced', lastSyncedAt: '12m ago' },
  { id: 'workspace', name: 'Project Workspace', icon: 'folder', connected: true, lastSyncedStatus: 'Context: Checkout 2.0', lastSyncedAt: '3m ago' },
  { id: 'notes', name: 'Meeting Notes', icon: 'file-text', connected: true, lastSyncedStatus: 'Synced 3 action items', lastSyncedAt: '25m ago' },
];

const INITIAL_MESSAGES: QueuedMessage[] = [
  {
    id: 'msg-1',
    sender_id: 'user-sarah',
    sender_name: 'Sarah Lin',
    sender_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Quick question',
    body: 'Whenever you finish your focus session, could you check the button padding in the checkout PR?',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'msg-2',
    sender_id: 'user-marcus',
    sender_name: 'Marcus Chen',
    sender_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Important',
    body: 'Staging PostgreSQL cluster will be restarted at 6 PM for maintenance (no downtime expected).',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'msg-3',
    sender_id: 'user-priya',
    sender_name: 'Priya Patel',
    sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Quick question',
    body: 'Shared the mobile checkout flow export in Figma whenever you take a break.',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
  },
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    workContexts: {},
    statusHistory: [],
    workEvents: [],
    integrations: {},
    queuedMessages: [],
  };
  private storageMode: 'postgres' | 'local-json' = process.env.DATABASE_URL ? 'postgres' : 'local-json';
  private pool: Pool | null = null;
  private ready: Promise<void>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const authSecret = process.env.AUTH_SECRET;
    if (databaseUrl && databaseUrl.trim()) {
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      console.log('[OmniWork DB] PostgreSQL/Supabase configured.');
      this.ready = this.initializePostgres();
    } else {
      this.storageMode = 'local-json';
      console.log('[OmniWork DB] Running in standalone development/demo mode with persistent local JSON storage.');
      this.ready = Promise.resolve().then(() => { this.data = this.loadLocal(); });
    }
    if (!authSecret) console.log('[OmniWork Auth] AUTH_SECRET not provided, using development fallback secret.');
  }

  private loadLocal(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) {
      console.warn('Could not read existing database file, initializing defaults:', e);
    }
    const initial = this.initialData();
    this.saveLocal(initial);
    return initial;
  }

  private initialData(): DatabaseSchema {
    return {
      users: INITIAL_USERS.map(u => ({ ...u, skills: [...u.skills] })),
      workContexts: Object.fromEntries(Object.entries(INITIAL_WORK_CONTEXTS).map(([k,v]) => [k, {...v}])),
      statusHistory: [{ id:'hist-1', user_id:'user-me', status:'Available', message:'Free for a quick discussion or questions.', created_at:new Date().toISOString() }],
      workEvents: INITIAL_WORK_EVENTS.map(e => ({...e})),
      integrations: { 'user-me': INITIAL_INTEGRATIONS.map(i => ({...i})) },
      queuedMessages: INITIAL_MESSAGES.map(m => ({...m})),
    };
  }

  private saveLocal(dataToSave?: DatabaseSchema) {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8'); }
    catch (err) { console.warn('Notice: Local database file not writable, keeping state in-memory:', (err as any)?.message || err); }
  }

  private async initializePostgres() {
    const pool = this.pool!;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL,
        avatar_url TEXT NOT NULL, skills TEXT[] NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS work_contexts (
        id TEXT PRIMARY KEY, user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('Focus','Available','Away')), project TEXT NOT NULL DEFAULT '',
        task TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', interrupt_for TEXT NOT NULL DEFAULT '',
        expires_at TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
      );
      CREATE TABLE IF NOT EXISTS status_history (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL
      );
      CREATE TABLE IF NOT EXISTS work_events (
        id TEXT PRIMARY KEY, team_id TEXT NOT NULL, source TEXT NOT NULL, category TEXT NOT NULL,
        title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', project TEXT NOT NULL DEFAULT '', target_user TEXT,
        action_required BOOLEAN NOT NULL DEFAULT FALSE, time_display TEXT NOT NULL DEFAULT 'Just now', created_at TIMESTAMPTZ NOT NULL
      );
      CREATE TABLE IF NOT EXISTS integrations (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, id TEXT NOT NULL, name TEXT NOT NULL,
        icon TEXT NOT NULL, connected BOOLEAN NOT NULL DEFAULT FALSE, last_synced_status TEXT, last_synced_at TEXT,
        PRIMARY KEY (user_id, id)
      );
      CREATE TABLE IF NOT EXISTS queued_messages (
        id TEXT PRIMARY KEY, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL, sender_avatar TEXT NOT NULL,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, recipient_name TEXT NOT NULL,
        urgency TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    const count = Number((await pool.query('SELECT COUNT(*)::int AS count FROM users')).rows[0].count);
    if (count === 0) await this.seedPostgres();
  }

  private async seedPostgres() {
    const p = this.pool!;
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      for (const u of INITIAL_USERS) await client.query(`INSERT INTO users(id,name,email,role,avatar_url,skills,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`, [u.id,u.name,u.email,u.role,u.avatar_url,u.skills,u.created_at]);
      for (const c of Object.values(INITIAL_WORK_CONTEXTS)) await client.query(`INSERT INTO work_contexts(id,user_id,status,project,task,message,interrupt_for,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [c.id,c.user_id,c.status,c.project,c.task,c.message,c.interrupt_for,c.expires_at,c.created_at,c.updated_at]);
      for (const h of [{id:'hist-1',user_id:'user-me',status:'Available',message:'Free for a quick discussion or questions.',created_at:new Date().toISOString()}]) await client.query(`INSERT INTO status_history(id,user_id,status,message,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [h.id,h.user_id,h.status,h.message,h.created_at]);
      for (const e of INITIAL_WORK_EVENTS) await client.query(`INSERT INTO work_events(id,team_id,source,category,title,detail,project,target_user,action_required,time_display,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`, [e.id,e.team_id,e.source,e.category,e.title,e.detail,e.project,e.target_user || null,e.action_required,e.time_display,e.created_at]);
      for (const i of INITIAL_INTEGRATIONS) await client.query(`INSERT INTO integrations(user_id,id,name,icon,connected,last_synced_status,last_synced_at) VALUES('user-me',$1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`, [i.id,i.name,i.icon,i.connected,i.lastSyncedStatus || null,i.lastSyncedAt || null]);
      for (const m of INITIAL_MESSAGES) await client.query(`INSERT INTO queued_messages(id,sender_id,sender_name,sender_avatar,recipient_id,recipient_name,urgency,body,created_at,read) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`, [m.id,m.sender_id,m.sender_name,m.sender_avatar,m.recipient_id,m.recipient_name,m.urgency,m.body,m.created_at,m.read]);
      await client.query('COMMIT');
    } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  public getStorageInfo() { return { mode:this.storageMode, databaseUrlConfigured:Boolean(process.env.DATABASE_URL), authSecretConfigured:Boolean(process.env.AUTH_SECRET), persistentFile:DB_PATH }; }

  async getUsers(): Promise<User[]> {
    await this.ready;
    if (!this.pool) return this.data.users;
    const r=await this.pool.query('SELECT id,name,email,role,avatar_url,skills,created_at FROM users ORDER BY created_at');
    return r.rows.map(this.userRow);
  }
  async getUser(id:string):Promise<User|undefined>{ const users=await this.getUsers(); return users.find(u=>u.id===id); }
  async getUserByEmail(email:string):Promise<User|undefined>{ const users=await this.getUsers(); return users.find(u=>u.email.toLowerCase()===email.toLowerCase()); }
  async updateUser(id:string, updates:Partial<User>):Promise<User|undefined>{
    await this.ready; const existing=await this.getUser(id); if(!existing)return;
    const u={...existing,...updates,id:existing.id};
    if(!this.pool){ const idx=this.data.users.findIndex(x=>x.id===id); this.data.users[idx]=u; this.saveLocal(); return u; }
    await this.pool.query('UPDATE users SET name=$1,role=$2,avatar_url=$3,skills=$4 WHERE id=$5',[u.name,u.role,u.avatar_url,u.skills,id]); return u;
  }
  async createUser(user:User):Promise<User>{
    await this.ready;
    if(!this.pool){ this.data.users.push(user); this.data.workContexts[user.id]=this.defaultContext(user.id); this.data.integrations[user.id]=INITIAL_INTEGRATIONS.map(i=>({...i})); this.saveLocal(); return user; }
    await this.pool.query('INSERT INTO users(id,name,email,role,avatar_url,skills,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[user.id,user.name,user.email,user.role,user.avatar_url,user.skills,user.created_at]);
    const c=this.defaultContext(user.id); await this.pool.query('INSERT INTO work_contexts(id,user_id,status,project,task,message,interrupt_for,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[c.id,c.user_id,c.status,c.project,c.task,c.message,c.interrupt_for,c.expires_at,c.created_at,c.updated_at]);
    for(const i of INITIAL_INTEGRATIONS) await this.pool.query('INSERT INTO integrations(user_id,id,name,icon,connected,last_synced_status,last_synced_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[user.id,i.id,i.name,i.icon,i.connected,i.lastSyncedStatus||null,i.lastSyncedAt||null]);
    return user;
  }
  private defaultContext(userId:string):WorkContext{return {id:`ctx-${userId}`,user_id:userId,status:'Available',project:'General',task:'Open for collaboration',message:'Available for questions or quick syncs.',interrupt_for:'Any questions or collaboration',expires_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};}

  async getWorkContext(userId:string):Promise<WorkContext|undefined>{await this.ready;if(!this.pool)return this.data.workContexts[userId];const r=await this.pool.query('SELECT * FROM work_contexts WHERE user_id=$1',[userId]);return r.rows[0]?this.contextRow(r.rows[0]):undefined;}
  async getAllWorkContexts():Promise<Record<string,WorkContext>>{await this.ready;if(!this.pool)return this.data.workContexts;const r=await this.pool.query('SELECT * FROM work_contexts');return Object.fromEntries(r.rows.map(x=>[x.user_id,this.contextRow(x)]));}
  async updateWorkContext(userId:string, update:Partial<WorkContext>):Promise<WorkContext>{
    await this.ready; const existing=await this.getWorkContext(userId)||this.defaultContext(userId); const updated={...existing,...update,updated_at:new Date().toISOString()};
    if(!this.pool){this.data.workContexts[userId]=updated;this.data.statusHistory.unshift({id:`hist-${Date.now()}`,user_id:userId,status:updated.status,message:updated.message||`${updated.status} mode`,created_at:new Date().toISOString()});const integrations=this.data.integrations[userId]||INITIAL_INTEGRATIONS;this.data.integrations[userId]=integrations.map(i=>i.id==='slack'?{...i,lastSyncedStatus:`${updated.status}${updated.project?` — Working on ${updated.project}`:''}`,lastSyncedAt:'Just now'}:i);this.saveLocal();return updated;}
    await this.pool.query('INSERT INTO work_contexts(id,user_id,status,project,task,message,interrupt_for,expires_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(user_id) DO UPDATE SET status=EXCLUDED.status,project=EXCLUDED.project,task=EXCLUDED.task,message=EXCLUDED.message,interrupt_for=EXCLUDED.interrupt_for,expires_at=EXCLUDED.expires_at,updated_at=EXCLUDED.updated_at',[updated.id,userId,updated.status,updated.project,updated.task,updated.message,updated.interrupt_for,updated.expires_at,updated.created_at,updated.updated_at]);
    await this.pool.query('INSERT INTO status_history(id,user_id,status,message,created_at) VALUES($1,$2,$3,$4,$5)',[`hist-${Date.now()}-${Math.random().toString(36).slice(2)}`,userId,updated.status,updated.message||`${updated.status} mode`,new Date().toISOString()]);
    await this.pool.query("UPDATE integrations SET last_synced_status=$1,last_synced_at='Just now' WHERE user_id=$2 AND id='slack'",[`${updated.status}${updated.project?` — Working on ${updated.project}`:''}`,userId]); return updated;
  }
  async getStatusHistory(userId?:string):Promise<StatusHistoryItem[]>{await this.ready;if(!this.pool){return userId?this.data.statusHistory.filter(h=>h.user_id===userId).slice(0,20):this.data.statusHistory.slice(0,30);}const r=userId?await this.pool.query('SELECT * FROM status_history WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',[userId]):await this.pool.query('SELECT * FROM status_history ORDER BY created_at DESC LIMIT 30');return r.rows.map(x=>({id:x.id,user_id:x.user_id,status:x.status,message:x.message,created_at:new Date(x.created_at).toISOString()}));}
  async getWorkEvents():Promise<WorkEvent[]>{await this.ready;if(!this.pool)return this.data.workEvents;const r=await this.pool.query('SELECT * FROM work_events ORDER BY created_at DESC');return r.rows.map(this.eventRow);}
  async addWorkEvent(event:Omit<WorkEvent,'id'|'created_at'>):Promise<WorkEvent>{await this.ready;const full={...event,id:`evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,created_at:new Date().toISOString()};if(!this.pool){this.data.workEvents.unshift(full);this.saveLocal();return full;}await this.pool.query('INSERT INTO work_events(id,team_id,source,category,title,detail,project,target_user,action_required,time_display,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[full.id,full.team_id,full.source,full.category,full.title,full.detail,full.project,full.target_user||null,full.action_required,full.time_display,full.created_at]);return full;}
  async getIntegrations(userId:string):Promise<IntegrationStatus[]>{await this.ready;if(!this.pool)return this.data.integrations[userId]||INITIAL_INTEGRATIONS;const r=await this.pool.query('SELECT id,name,icon,connected,last_synced_status,last_synced_at FROM integrations WHERE user_id=$1 ORDER BY id',[userId]);return r.rows.map((x:any)=>({id:x.id,name:x.name,icon:x.icon,connected:x.connected,lastSyncedStatus:x.last_synced_status||undefined,lastSyncedAt:x.last_synced_at||undefined}));}
  async toggleIntegration(userId:string,integrationId:string):Promise<IntegrationStatus[]>{await this.ready;const list=await this.getIntegrations(userId);const item=list.find(i=>i.id===integrationId);if(item){item.connected=!item.connected;item.lastSyncedAt='Just now';}if(!this.pool){this.data.integrations[userId]=list;this.saveLocal();return list;}await this.pool.query('UPDATE integrations SET connected=$1,last_synced_at=$2 WHERE user_id=$3 AND id=$4',[item?.connected||false,'Just now',userId,integrationId]);return this.getIntegrations(userId);}
  async getQueuedMessages(userId:string):Promise<QueuedMessage[]>{await this.ready;if(!this.pool)return this.data.queuedMessages.filter(m=>m.recipient_id===userId);const r=await this.pool.query('SELECT * FROM queued_messages WHERE recipient_id=$1 ORDER BY created_at DESC',[userId]);return r.rows.map(this.messageRow);}
  async addQueuedMessage(message:Omit<QueuedMessage,'id'|'created_at'|'read'>):Promise<QueuedMessage>{await this.ready;const full={...message,id:`msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,created_at:new Date().toISOString(),read:false};if(!this.pool){this.data.queuedMessages.unshift(full);this.saveLocal();return full;}await this.pool.query('INSERT INTO queued_messages(id,sender_id,sender_name,sender_avatar,recipient_id,recipient_name,urgency,body,created_at,read) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[full.id,full.sender_id,full.sender_name,full.sender_avatar,full.recipient_id,full.recipient_name,full.urgency,full.body,full.created_at,full.read]);return full;}
  async markMessagesRead(userId:string){await this.ready;if(!this.pool){this.data.queuedMessages=this.data.queuedMessages.map(m=>m.recipient_id===userId?{...m,read:true}:m);this.saveLocal();return;}await this.pool.query('UPDATE queued_messages SET read=true WHERE recipient_id=$1',[userId]);}
  async resetDemoData(){await this.ready;if(!this.pool){this.data=this.initialData();this.saveLocal();return true;}const p=this.pool;await p.query('TRUNCATE queued_messages, integrations, work_events, status_history, work_contexts, users CASCADE');await this.seedPostgres();return true;}

  private userRow=(x:any):User=>({id:x.id,name:x.name,email:x.email,role:x.role,avatar_url:x.avatar_url,skills:x.skills||[],created_at:new Date(x.created_at).toISOString()});
  private contextRow=(x:any):WorkContext=>({id:x.id,user_id:x.user_id,status:x.status,project:x.project,task:x.task,message:x.message,interrupt_for:x.interrupt_for,expires_at:x.expires_at,created_at:new Date(x.created_at).toISOString(),updated_at:new Date(x.updated_at).toISOString()});
  private eventRow=(x:any):WorkEvent=>({id:x.id,team_id:x.team_id,source:x.source,category:x.category,title:x.title,detail:x.detail,project:x.project,target_user:x.target_user||undefined,action_required:x.action_required,time_display:x.time_display,created_at:new Date(x.created_at).toISOString()});
  private messageRow=(x:any):QueuedMessage=>({id:x.id,sender_id:x.sender_id,sender_name:x.sender_name,sender_avatar:x.sender_avatar,recipient_id:x.recipient_id,recipient_name:x.recipient_name,urgency:x.urgency,body:x.body,created_at:new Date(x.created_at).toISOString(),read:x.read});
}

export const db = new Database();
