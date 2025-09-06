require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const path = require('path');

// Robust Firebase Admin initialization: prefer service account JSON via env, fallback to ADC
(function initFirebaseAdmin() {
  try {
    const tryPaths = [];
    const saEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (saEnv) {
      const saPath = saEnv.replace(/^"(.*)"$/, '$1');
      tryPaths.push(path.isAbsolute(saPath) ? saPath : path.resolve(process.cwd(), saPath));
    }
    // Known default relative to server directory -> project root
    tryPaths.push(path.resolve(__dirname, '..', 'medical-8d62a-firebase-adminsdk-fbsvc-3999168c80.json'));

    for (const p of tryPaths) {
      try {
        const serviceAccount = require(p);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        // eslint-disable-next-line no-console
        console.log('Firebase Admin initialized with service account:', p);
        return;
      } catch (e) {
        // continue trying next path
      }
    }

    // Last resort: ADC (may fail locally)
    admin.initializeApp();
    console.warn('Firebase Admin initialized via ADC (no service account found).');
  } catch (e) {
    console.error('Firebase Admin init error:', e.message);
    throw e;
  }
})();

const db = admin.firestore();

const app = express();

// Security & performance hardening
app.disable('x-powered-by');
app.set('trust proxy', 1); // required if behind proxy/ingress to get correct client IP

// CORS configuration via environment
const parseOrigins = (value) => {
  if (!value) return [];
  return value.split(',').map((o) => o.trim()).filter(Boolean);
};
const allowedOrigins = parseOrigins(process.env.CLIENT_ORIGIN || 'http://localhost:3000');
const corsOptions = {
  origin: function (origin, callback) {
    // Allow REST tools or same-origin requests without origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet({
  // Helmet will set security headers for API responses; CSP for Next.js pages is in next.config.ts
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting for all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // adjust per your traffic profile
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoints
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// ===== Maternal Facilities, Availability, Transport (Mock/Mongo-ready) =====
// In-memory mock dataset (replace with MongoDB in production)
const FACILITIES = [
  {
    id: 'f1',
    name: 'City Women\'s Hospital',
    latitude: 8.9806,
    longitude: 38.7578,
    level: 'hospital',
    services: ['maternal', 'emergency', 'neonatal'],
    phone: '+251-11-123-4567',
    address: 'Kazanchis, Addis Ababa',
    sponsorship: 'ngo',
  },
  {
    id: 'f2',
    name: 'St. Mary Clinic',
    latitude: 8.995,
    longitude: 38.78,
    level: 'clinic',
    services: ['maternal', 'emergency'],
    phone: '+251-11-765-4321',
    address: 'Bole, Addis Ababa',
    sponsorship: 'private',
  },
  {
    id: 'f3',
    name: 'Regional Referral Hospital',
    latitude: 9.03,
    longitude: 38.74,
    level: 'specialist',
    services: ['maternal', 'surgery', 'emergency'],
    phone: '+251-11-222-0000',
    address: 'Yeka, Addis Ababa',
    sponsorship: 'government',
  },
];

const AVAILABILITY = new Map([
  ['f1', { doctors: 4, nurses: 12, status: 'available', updatedAt: new Date().toISOString() }],
  ['f2', { doctors: 1, nurses: 6, status: 'busy', updatedAt: new Date().toISOString() }],
  ['f3', { doctors: 6, nurses: 20, status: 'available', updatedAt: new Date().toISOString() }],
]);

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
  return R * c;
}

// GET /api/facilities/nearby?lat&lng&radius=25
app.get('/api/facilities/nearby', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 25);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'lat,lng required' });
  const facilities = FACILITIES.map((f) => ({
    ...f,
    distanceKm: haversineKm(lat, lng, f.latitude, f.longitude),
  }))
    .filter((f) => f.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 50);
  res.json({ facilities });
});

// GET /api/facilities/:id/availability
app.get('/api/facilities/:id/availability', (req, res) => {
  const v = AVAILABILITY.get(String(req.params.id));
  if (!v) return res.status(404).json({ error: 'not found' });
  res.json({ id: req.params.id, availability: v });
});

// POST /api/transport/request { lat, lng, mode }
app.post('/api/transport/request', (req, res) => {
  const { lat, lng, mode } = req.body || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !mode) {
    return res.status(400).json({ error: 'lat,lng,mode required' });
  }
  // Mock adapter: compute ETA based on mode
  const eta = mode === 'ambulance' ? 10 : mode === 'motorcycle' ? 6 : 8;
  res.json({ ok: true, etaMinutes: eta });
});

// Session verification middleware for /api/*
function getSessionCookie(req) {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';');
  for (const p of parts) {
    const [k, ...v] = p.trim().split('=');
    if (k === 'session') return decodeURIComponent(v.join('='));
  }
  return null;
}
app.use('/api', async (req, res, next) => {
  if (req.path === '/session' || req.path === '/session/logout') return next();
  try {
    const token = getSessionCookie(req);
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const decoded = await admin.auth().verifySessionCookie(token, false);
    req.user = { uid: decoded.uid, role: decoded.role };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
});

// RBAC helper
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !roles.includes(role)) return res.status(403).json({ error: 'FORBIDDEN' });
    return next();
  };
}

// === Appointments API ===
// GET /api/appointments?doctorId=&patientId=&status=&from=&to=&limit=
app.get('/api/appointments', async (req, res, next) => {
  try {
    const { doctorId, patientId, status, from, to, limit } = req.query;
    let ref = db.collection('appointments');
    if (doctorId) ref = ref.where('doctorId', '==', String(doctorId));
    if (patientId) ref = ref.where('patientId', '==', String(patientId));
    if (status) ref = ref.where('status', '==', String(status));
    if (from) {
      const d = new Date(String(from));
      if (!isNaN(d.getTime())) ref = ref.where('startAt', '>=', d.toISOString());
    }
    if (to) {
      const d = new Date(String(to));
      if (!isNaN(d.getTime())) ref = ref.where('startAt', '<=', d.toISOString());
    }
    const lim = Math.min(parseInt(String(limit || '50'), 10) || 50, 200);
    const snap = await ref.orderBy('startAt', 'desc').limit(lim).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ items });
  } catch (err) { next(err); }
});

// Export appointments as CSV
app.get('/api/appointments/export', async (req, res, next) => {
  try {
    const { doctorId, patientId, status, from, to, limit } = req.query;
    let ref = db.collection('appointments');
    if (doctorId) ref = ref.where('doctorId', '==', String(doctorId));
    if (patientId) ref = ref.where('patientId', '==', String(patientId));
    if (status) ref = ref.where('status', '==', String(status));
    if (from) {
      const d = new Date(String(from));
      if (!isNaN(d.getTime())) ref = ref.where('startAt', '>=', d.toISOString());
    }
    if (to) {
      const d = new Date(String(to));
      if (!isNaN(d.getTime())) ref = ref.where('startAt', '<=', d.toISOString());
    }
    const lim = Math.min(parseInt(String(limit || '1000'), 10) || 1000, 5000);
    const snap = await ref.orderBy('startAt', 'desc').limit(lim).get();
    const rows = [
      ['id', 'patientId', 'doctorId', 'startAt', 'endAt', 'type', 'status', 'notes'],
      ...snap.docs.map((d) => {
        const a = d.data();
        return [d.id, a.patientId || '', a.doctorId || '', a.startAt || '', a.endAt || '', a.type || '', a.status || '', (a.notes || '').replaceAll('\n', ' ')]
      })
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"');
    res.send(csv);
  } catch (err) { next(err); }
});

// POST /api/appointments
app.post('/api/appointments', requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const { patientId, doctorId, startAt, endAt, type, notes } = req.body || {};
    if (!patientId || !doctorId || !startAt || !endAt || !type) {
      return res.status(400).json({ error: 'patientId, doctorId, startAt, endAt, and type are required' });
    }

    // Conflict detection: overlapping appointments for the same doctor
    const startISO = String(startAt);
    const endISO = String(endAt);
    const q = await db
      .collection('appointments')
      .where('doctorId', '==', String(doctorId))
      .where('startAt', '<', endISO)
      .orderBy('startAt', 'desc')
      .limit(50)
      .get();
    const overlaps = q.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.endAt > startISO);
    if (overlaps.length > 0) {
      return res.status(409).json({ error: 'Timeslot overlaps existing appointment' });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const data = {
      patientId: String(patientId),
      doctorId: String(doctorId),
      startAt: startISO,
      endAt: endISO,
      type: String(type),
      notes: notes ? String(notes) : '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const doc = await db.collection('appointments').add(data);

    // Audit log
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'create',
      resourceType: 'appointment',
      resourceId: doc.id,
      after: data,
      at: now,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });

    const saved = await doc.get();
    res.status(201).json({ id: doc.id, ...saved.data() });
  } catch (err) { next(err); }
});

// GET /api/appointments/:id
app.get('/api/appointments/:id', async (req, res, next) => {
  try {
    const doc = await db.collection('appointments').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { next(err); }
});

// PATCH /api/appointments/:id
app.patch('/api/appointments/:id', requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const allowed = ['startAt', 'endAt', 'type', 'notes', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    const ref = db.collection('appointments').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    // Optional conflict check if times are changing
    if (updates.startAt || updates.endAt) {
      const current = doc.data();
      const newStart = String(updates.startAt || current.startAt);
      const newEnd = String(updates.endAt || current.endAt);
      const q = await db
        .collection('appointments')
        .where('doctorId', '==', current.doctorId)
        .where('startAt', '<', newEnd)
        .orderBy('startAt', 'desc')
        .limit(50)
        .get();
      const overlaps = q.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.id !== req.params.id && a.endAt > newStart);
      if (overlaps.length > 0) return res.status(409).json({ error: 'Timeslot overlaps existing appointment' });
    }

    await ref.update(updates);

    // Audit log
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'update',
      resourceType: 'appointment',
      resourceId: req.params.id,
      after: updates,
      at: updates.updatedAt,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });

    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (err) { next(err); }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const ref = db.collection('appointments').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await ref.delete();

    // Audit log
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'delete',
      resourceType: 'appointment',
      resourceId: req.params.id,
      at: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });

    res.status(204).end();
  } catch (err) { next(err); }
});

// === Patients API ===
// GET /api/patients?query=&limit=
app.get('/api/patients', async (req, res, next) => {
  try {
    const { query, limit } = req.query;
    let ref = db.collection('patients');
    // For demo, simple list with limit; implement search with an index in production
    const lim = Math.min(parseInt(String(limit || '50'), 10) || 50, 200);
    const snap = await ref.orderBy('createdAt', 'desc').limit(lim).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ items });
  } catch (err) { next(err); }
});

// Export patients as CSV
app.get('/api/patients/export', async (req, res, next) => {
  try {
    const { limit } = req.query;
    let ref = db.collection('patients');
    const lim = Math.min(parseInt(String(limit || '1000'), 10) || 1000, 5000);
    const snap = await ref.orderBy('createdAt', 'desc').limit(lim).get();
    const rows = [
      ['id', 'name', 'email', 'phone', 'dob', 'gender', 'notes'],
      ...snap.docs.map((d) => {
        const p = d.data();
        return [d.id, p.name || '', p.email || '', p.phone || '', p.dob || '', p.gender || '', (p.notes || '').replaceAll('\n', ' ')];
      })
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="patients.csv"');
    res.send(csv);
  } catch (err) { next(err); }
});

// POST /api/patients
app.post('/api/patients', requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const { name, email, phone, dob, gender, notes } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const now = admin.firestore.FieldValue.serverTimestamp();
    const data = {
      name: String(name),
      email: email ? String(email) : '',
      phone: phone ? String(phone) : '',
      dob: dob ? String(dob) : '',
      gender: gender ? String(gender) : '',
      notes: notes ? String(notes) : '',
      createdAt: now,
      updatedAt: now,
    };
    const doc = await db.collection('patients').add(data);
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'create',
      resourceType: 'patient',
      resourceId: doc.id,
      after: data,
      at: now,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });
    const saved = await doc.get();
    res.status(201).json({ id: doc.id, ...saved.data() });
  } catch (err) { next(err); }
});

// GET /api/patients/:id
app.get('/api/patients/:id', async (req, res, next) => {
  try {
    const doc = await db.collection('patients').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { next(err); }
});

// PATCH /api/patients/:id
app.patch('/api/patients/:id', requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'phone', 'dob', 'gender', 'notes'];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    const ref = db.collection('patients').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await ref.update(updates);
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'update',
      resourceType: 'patient',
      resourceId: req.params.id,
      after: updates,
      at: updates.updatedAt,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });
    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (err) { next(err); }
});

// DELETE /api/patients/:id
app.delete('/api/patients/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const ref = db.collection('patients').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await ref.delete();
    await db.collection('auditLogs').add({
      actorId: (req.user && req.user.uid) || req.headers['x-user-id'] || 'demo',
      action: 'delete',
      resourceType: 'patient',
      resourceId: req.params.id,
      at: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });
    res.status(204).end();
  } catch (err) { next(err); }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('thread:join', (threadId) => {
    if (typeof threadId === 'string' && threadId) {
      socket.join(threadId);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Admin: set user role (custom claims)
app.post('/api/admin/users/:uid/role', requireRole('admin'), async (req, res, next) => {
  try {
    const uid = req.params.uid;
    const role = String(req.body?.role || '').trim();
    const allowed = new Set(['admin', 'doctor', 'nurse', 'patient']);
    if (!allowed.has(role)) return res.status(400).json({ error: 'INVALID_ROLE' });
    await admin.auth().setCustomUserClaims(uid, { role });
    res.json({ ok: true, uid, role });
  } catch (err) { next(err); }
});

// === Messaging API ===
// Create a thread with members (includes current user)
app.post('/api/threads', requireRole('doctor', 'nurse', 'admin', 'patient'), async (req, res, next) => {
  try {
    const members = Array.isArray(req.body?.members) ? req.body.members.map(String) : [];
    const uid = req.user && req.user.uid;
    if (!uid) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!members.includes(uid)) members.push(uid);
    const unique = Array.from(new Set(members)).filter(Boolean);
    if (unique.length < 2) return res.status(400).json({ error: 'NEED_AT_LEAST_TWO_MEMBERS' });
    const now = admin.firestore.FieldValue.serverTimestamp();
    const data = { memberIds: unique, lastMessageAt: now, createdAt: now };
    const doc = await db.collection('threads').add(data);
    await db.collection('auditLogs').add({
      actorId: uid,
      action: 'create',
      resourceType: 'thread',
      resourceId: doc.id,
      after: data,
      at: now,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });
    const saved = await doc.get();
    res.status(201).json({ id: doc.id, ...saved.data() });
  } catch (err) { next(err); }
});

// List threads for a member (defaults to current user)
app.get('/api/threads', requireRole('doctor', 'nurse', 'admin', 'patient'), async (req, res, next) => {
  try {
    const uid = (typeof req.query.member === 'string' && req.query.member.trim()) || (req.user && req.user.uid);
    if (!uid) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const lim = Math.min(parseInt(String(req.query.limit || '50'), 10) || 50, 200);
    const snap = await db.collection('threads').where('memberIds', 'array-contains', uid).orderBy('lastMessageAt', 'desc').limit(lim).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ items });
  } catch (err) { next(err); }
});

// List messages in a thread
app.get('/api/messages', requireRole('doctor', 'nurse', 'admin', 'patient'), async (req, res, next) => {
  try {
    const threadId = String(req.query.threadId || '').trim();
    if (!threadId) return res.status(400).json({ error: 'threadId is required' });
    const thread = await db.collection('threads').doc(threadId).get();
    if (!thread.exists) return res.status(404).json({ error: 'THREAD_NOT_FOUND' });
    const members = thread.data().memberIds || [];
    const uid = req.user && req.user.uid;
    if (!members.includes(uid)) return res.status(403).json({ error: 'FORBIDDEN' });
    const lim = Math.min(parseInt(String(req.query.limit || '100'), 10) || 100, 500);
    const snap = await db.collection('messages').where('threadId', '==', threadId).orderBy('createdAt', 'asc').limit(lim).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ items });
  } catch (err) { next(err); }
});

// Send a message
app.post('/api/messages', requireRole('doctor', 'nurse', 'admin', 'patient'), async (req, res, next) => {
  try {
    const { threadId, text } = req.body || {};
    const uid = req.user && req.user.uid;
    if (!threadId || !text) return res.status(400).json({ error: 'threadId and text are required' });
    const threadRef = db.collection('threads').doc(String(threadId));
    const thread = await threadRef.get();
    if (!thread.exists) return res.status(404).json({ error: 'THREAD_NOT_FOUND' });
    const members = thread.data().memberIds || [];
    if (!members.includes(uid)) return res.status(403).json({ error: 'FORBIDDEN' });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const msgData = { threadId: String(threadId), senderId: uid, text: String(text), createdAt: now };
    const msgDoc = await db.collection('messages').add(msgData);
    await threadRef.update({ lastMessageAt: now });
    await db.collection('auditLogs').add({
      actorId: uid,
      action: 'create',
      resourceType: 'message',
      resourceId: msgDoc.id,
      after: msgData,
      at: now,
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    });

    // Broadcast to thread room
    try { io.to(String(threadId)).emit('message:new', { id: msgDoc.id, ...msgData, createdAt: new Date().toISOString() }); } catch { }

    const saved = await msgDoc.get();
    res.status(201).json({ id: msgDoc.id, ...saved.data() });
  } catch (err) { next(err); }
});

// === Auth Sessions ===
// Create session cookie from Firebase ID token
app.post('/api/session', async (req, res, next) => {
  try {
    const idToken = req.body?.idToken;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });
    // Verify the ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Create a session cookie (e.g., 14 days)
    const expiresIn = 14 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('session', sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });
    return res.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    return next(err);
  }
});

// Clear session cookie
app.post('/api/session/logout', async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('session', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ ok: true });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const httpServer = server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  io.close(() => {
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
  // Force exit if not closed in time
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = httpServer;