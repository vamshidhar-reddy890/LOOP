import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { query } from './db.js';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import tesseract from 'node-tesseract-ocr';

const app = express();
const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'loop-secret';

const upload = multer({ storage: multer.memoryStorage() });

function createTimestamp() {
  return new Date().toISOString();
}

async function seedData() {
  const existingUsers = await query('SELECT COUNT(*)::int AS count FROM users');
  if (existingUsers.rows[0].count > 0) {
    return;
  }

  await query('INSERT INTO workspaces (name, description, member_count, feedback_count) VALUES ($1, $2, $3, $4)', ['Northstar Workspace', 'Customer feedback for the Northstar product suite.', 2, 0]);
  await query('INSERT INTO workspaces (name, description, member_count, feedback_count) VALUES ($1, $2, $3, $4)', ['Atlas Launchpad', 'Alpha feedback for new onboarding flows.', 1, 0]);

  const adminPassword = bcrypt.hashSync('Admin123!', 10);
  const analystPassword = bcrypt.hashSync('Analyst123!', 10);
  const viewerPassword = bcrypt.hashSync('Viewer123!', 10);
  await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Avery Chen', 'admin@loop.com', adminPassword, 'ADMIN']);
  await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Riley Park', 'analyst@loop.com', analystPassword, 'ANALYST']);
  await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Samir Patel', 'viewer@loop.com', viewerPassword, 'VIEWER']);
  await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Jamie Rivera', 'jamie@loop.com', bcrypt.hashSync('password123', 10), 'MEMBER']);

  const workspaceRows = await query('SELECT id FROM workspaces ORDER BY id');
  const [workspaceOne, workspaceTwo] = workspaceRows.rows;

  await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
    'The onboarding experience feels much smoother and I finally understand the value quickly.',
    'APP_REVIEW',
    'POSITIVE',
    0.84,
    ['Onboarding'],
    'Nia',
    5,
    '2026-07-24T14:00:00.000Z',
    workspaceOne.id,
  ]);
  await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
    'The dashboard is powerful, but the export flow is still confusing on mobile.',
    'SUPPORT_TICKET',
    'NEUTRAL',
    0.5,
    ['Analytics', 'Reporting'],
    'Marcus',
    4,
    '2026-07-25T09:15:00.000Z',
    workspaceOne.id,
  ]);
  await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
    'I was frustrated by the delayed analytics update and the lack of error messaging.',
    'SURVEY',
    'NEGATIVE',
    0.12,
    ['Analytics', 'Reliability'],
    'Dina',
    2,
    '2026-07-26T21:10:00.000Z',
    workspaceTwo.id,
  ]);
  await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
    'The new tagging feature reduced our response time dramatically and helped us triage requests.',
    'COMMUNITY_POST',
    'POSITIVE',
    0.84,
    ['Productivity'],
    'Luis',
    5,
    '2026-07-27T16:40:00.000Z',
    workspaceOne.id,
  ]);

  await query('UPDATE workspaces SET feedback_count = (SELECT COUNT(*) FROM feedbacks WHERE workspace_id = workspaces.id)');

  await query('INSERT INTO reports (title, type, period_start, period_end, summary, insights, status, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
    'Weekly customer insights',
    'WEEKLY',
    '2026-07-20',
    '2026-07-27',
    'Customers are most engaged around onboarding and reporting quality.',
    JSON.stringify([
      { category: 'Onboarding', description: 'New users are responding well to the improved setup experience.', impact: 'HIGH', metrics: { positive: 8, count: 12 } },
      { category: 'Reliability', description: 'A subset of customers still flag stale analytics updates.', impact: 'MEDIUM', metrics: { negative: 3, count: 4 } },
    ]),
    'COMPLETED',
    new Date().toISOString(),
    workspaceOne.id,
  ]);
}

function inferSentiment(content) {
  const lowered = content.toLowerCase();
  if (lowered.includes('frustrated') || lowered.includes('bad') || lowered.includes('confusing') || lowered.includes('delay') || lowered.includes('lack')) {
    return 'NEGATIVE';
  }
  if (lowered.includes('great') || lowered.includes('smooth') || lowered.includes('dramatically') || lowered.includes('well')) {
    return 'POSITIVE';
  }
  return 'NEUTRAL';
}

function inferThemes(content) {
  const lowered = (content || '').toLowerCase();
  const themes = [];
  if (lowered.includes('onboarding')) themes.push('Onboarding');
  if (lowered.includes('analytics') || lowered.includes('dashboard')) themes.push('Analytics');
  if (lowered.includes('export')) themes.push('Reporting');
  if (lowered.includes('mobile')) themes.push('Mobile UX');
  if (themes.length === 0) themes.push('General');
  return themes;
}

async function extractTextFromFile(file) {
  const filename = file.originalname || 'file';
  const lower = filename.toLowerCase();
  try {
    // PDF text extraction
    if (lower.endsWith('.pdf') || (file.mimetype && file.mimetype.includes('pdf'))) {
      try {
        const data = await pdfParse(file.buffer);
        if (data && data.text && data.text.trim().length > 0) return data.text.trim();
      } catch (e) {
        console.error('PDF text extraction failed', e.message || e);
      }
    }

    // DOCX extraction
    if (lower.endsWith('.docx') || (file.mimetype && file.mimetype.includes('wordprocessingml'))) {
      try {
        const res = await mammoth.extractRawText({ buffer: file.buffer });
        if (res && res.value) return res.value.trim();
      } catch (e) {
        console.error('DOCX extraction failed', e.message || e);
      }
    }

    // Images (OCR via tesseract)
    if (lower.match(/\.(png|jpg|jpeg|tiff|bmp)$/) || (file.mimetype && file.mimetype.startsWith('image/'))) {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const tmpPath = path.join(uploadsDir, `ocr-${Date.now()}-${filename.replace(/[^a-z0-9_.-]/gi, '_')}`);
        fs.writeFileSync(tmpPath, file.buffer);
        const text = await tesseract.recognize(tmpPath, { lang: 'eng' });
        try { fs.unlinkSync(tmpPath); } catch (e) { /* ignore */ }
        if (text && text.trim().length > 0) return text.trim();
      } catch (e) {
        console.error('Image OCR failed', e.message || e);
      }
    }
  } catch (err) {
    console.error('extractTextFromFile error', err);
  }
  return '';
}

function sentimentScoreFor(sentiment) {
  if (sentiment === 'POSITIVE') return 0.84;
  if (sentiment === 'NEGATIVE') return 0.12;
  return 0.5;
}

async function buildStats(workspaceId) {
  const baseQuery = `SELECT * FROM feedbacks${workspaceId ? ' WHERE workspace_id = $1' : ''}`;
  const values = workspaceId ? [workspaceId] : [];
  const { rows } = await query(baseQuery, values);
  const positiveCount = rows.filter((entry) => entry.sentiment === 'POSITIVE').length;
  const negativeCount = rows.filter((entry) => entry.sentiment === 'NEGATIVE').length;
  const neutralCount = rows.filter((entry) => entry.sentiment === 'NEUTRAL').length;

  return {
    totalFeedback: rows.length,
    positiveCount,
    negativeCount,
    neutralCount,
    sentimentDistribution: [
      { name: 'Positive', value: positiveCount, color: '#10b981' },
      { name: 'Neutral', value: neutralCount, color: '#f59e0b' },
      { name: 'Negative', value: negativeCount, color: '#ef4444' },
    ],
    feedbackTrend: rows.slice(-6).map((entry) => ({ date: entry.created_at.slice(0, 10), count: 1, sentiment: entry.sentiment })),
    themeDistribution: Object.entries(rows.reduce((acc, entry) => {
      entry.themes.forEach((theme) => {
        acc[theme] = (acc[theme] || 0) + 1;
      });
      return acc;
    }, {})).map(([name, count]) => ({ name, count })),
    recentFeedback: rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
  };
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

app.use(cors());
app.use(express.json());
// serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at } });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'A user with that email already exists.' });
  }

  const userResult = await query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, bcrypt.hashSync(password, 10), 'MEMBER']);
  const user = userResult.rows[0];
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  const workspaceResult = await query('INSERT INTO workspaces (name, description, member_count, feedback_count) VALUES ($1, $2, $3, $4) RETURNING *', [`${name.split(' ')[0]}'s Workspace`, 'A fresh workspace ready for your feedback loop.', 1, 0]);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at } });
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role, createdAt: rows[0].created_at });
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
  const user = rows[0];
  const updated = await query('UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3 RETURNING *', [req.body.name || null, req.body.role || null, req.user.id]);
  res.json({ id: updated.rows[0].id, name: updated.rows[0].name, email: updated.rows[0].email, role: updated.rows[0].role, createdAt: updated.rows[0].created_at });
});

app.put('/api/auth/password', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(req.body.oldPassword, user.password)) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }
  await query('UPDATE users SET password = $1 WHERE id = $2', [bcrypt.hashSync(req.body.newPassword, 10), req.user.id]);
  res.json({ message: 'Password updated.' });
});

app.get('/api/workspaces', authenticate, async (_req, res) => {
  const { rows } = await query('SELECT * FROM workspaces ORDER BY id');
  res.json(rows);
});

app.get('/api/workspaces/:id', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM workspaces WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Workspace not found.' });
  res.json(rows[0]);
});

app.post('/api/workspaces', authenticate, async (req, res) => {
  const result = await query('INSERT INTO workspaces (name, description, member_count, feedback_count) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.description || '', 1, 0]);
  res.status(201).json(result.rows[0]);
});

app.put('/api/workspaces/:id', authenticate, async (req, res) => {
  const result = await query('UPDATE workspaces SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *', [req.body.name || null, req.body.description || null, req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Workspace not found.' });
  res.json(result.rows[0]);
});

app.delete('/api/workspaces/:id', authenticate, async (req, res) => {
  await query('DELETE FROM workspaces WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

app.get('/api/feedback', authenticate, async (req, res) => {
  const { search, sentiment, source, startDate, endDate, page = 0, size = 10, sortBy = 'created_at', sortDir = 'desc' } = req.query;
  const whereClauses = [];
  const values = [];
  let index = 1;

  if (search) {
    whereClauses.push(`content ILIKE $${index}`);
    values.push(`%${search}%`);
    index += 1;
  }
  if (sentiment) {
    whereClauses.push(`sentiment = $${index}`);
    values.push(sentiment);
    index += 1;
  }
  if (source) {
    whereClauses.push(`source = $${index}`);
    values.push(source);
    index += 1;
  }
  if (startDate) {
    whereClauses.push(`created_at >= $${index}`);
    values.push(startDate);
    index += 1;
  }
  if (endDate) {
    whereClauses.push(`created_at <= $${index}`);
    values.push(endDate);
    index += 1;
  }

  const queryText = `SELECT * FROM feedbacks${whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : ''} ORDER BY ${sortBy} ${sortDir === 'asc' ? 'ASC' : 'DESC'} LIMIT $${index} OFFSET $${index + 1}`;
  values.push(Number(size), Number(page) * Number(size));
  const result = await query(queryText, values);
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM feedbacks${whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : ''}` , values.slice(0, -2));

  res.json({ content: result.rows, totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / Number(size)) || 1), totalElements: countResult.rows[0].total, size: Number(size), number: Number(page), first: Number(page) === 0, last: Number(page) * Number(size) + result.rows.length >= countResult.rows[0].total });
});

app.post('/api/feedback', authenticate, async (req, res) => {
  const result = await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [req.body.content, req.body.source || 'SUPPORT_TICKET', req.body.sentiment || inferSentiment(req.body.content), sentimentScoreFor(req.body.sentiment || inferSentiment(req.body.content)), req.body.themes || inferThemes(req.body.content), req.body.customerName, req.body.rating || 3, req.body.createdAt || new Date().toISOString(), req.body.workspaceId || 1]);
  await query('UPDATE workspaces SET feedback_count = (SELECT COUNT(*) FROM feedbacks WHERE workspace_id = workspaces.id)');
  res.status(201).json(result.rows[0]);
});

app.put('/api/feedback/:id', authenticate, async (req, res) => {
  const result = await query('UPDATE feedbacks SET content = COALESCE($1, content), source = COALESCE($2, source), sentiment = COALESCE($3, sentiment), sentiment_score = COALESCE($4, sentiment_score), themes = COALESCE($5, themes), customer_name = COALESCE($6, customer_name), rating = COALESCE($7, rating) WHERE id = $8 RETURNING *', [req.body.content || null, req.body.source || null, req.body.sentiment || null, req.body.sentimentScore || null, req.body.themes || null, req.body.customerName || null, req.body.rating || null, req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Feedback not found.' });
  res.json(result.rows[0]);
});

app.delete('/api/feedback/:id', authenticate, async (req, res) => {
  await query('DELETE FROM feedbacks WHERE id = $1', [req.params.id]);
  await query('UPDATE workspaces SET feedback_count = (SELECT COUNT(*) FROM feedbacks WHERE workspace_id = workspaces.id)');
  res.status(204).send();
});

app.post('/api/feedback/import', authenticate, upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'File is required.' });

  const filename = file.originalname || 'uploaded_file';
  const lower = filename.toLowerCase();
  const workspaceId = req.body.workspaceId ? Number(req.body.workspaceId) : 1;

  // If CSV, parse rows as before
  if (lower.endsWith('.csv') || file.mimetype.includes('csv') || filename.endsWith('.csv')) {
    const rows = parseCsv(file.buffer.toString('utf-8'));
    const imported = [];
    for (const row of rows) {
      const entry = await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [row.content || row.feedback || 'Imported feedback', row.source || 'SURVEY', row.sentiment || inferSentiment(row.content || row.feedback || ''), sentimentScoreFor(row.sentiment || inferSentiment(row.content || row.feedback || '')), inferThemes(row.content || row.feedback || ''), row.customerName || row.customer || '', Number(row.rating) || 3, row.createdAt || new Date().toISOString(), row.workspaceId || workspaceId]);
      imported.push(entry.rows[0]);
    }
    await query('UPDATE workspaces SET feedback_count = (SELECT COUNT(*) FROM feedbacks WHERE workspace_id = workspaces.id)');
    return res.json({ totalRows: rows.length, importedRows: imported.length, errors: [] });
  }

  // For other file types (pdf, doc, docx, images, etc.) save file, try to extract text, and create a feedback entry referencing it
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const safeName = filename.replace(/[^a-z0-9_.-]/gi, '_');
  const targetName = `${Date.now()}-${safeName}`;
  const savedPath = path.join(uploadsDir, targetName);
  try {
    fs.writeFileSync(savedPath, file.buffer);
  } catch (err) {
    console.error('Failed to save uploaded file', err);
    return res.status(500).json({ message: 'Failed to save uploaded file.' });
  }

  // Attempt to extract text from the saved file
  let extracted = '';
  try {
    extracted = await extractTextFromFile(file);
  } catch (e) {
    console.error('Text extraction failed', e);
  }

  const contentToSave = extracted && extracted.trim().length > 0 ? extracted : `Imported file: ${filename}`;

  const inserted = await query('INSERT INTO feedbacks (content, source, sentiment, sentiment_score, themes, customer_name, rating, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [contentToSave, 'FILE_UPLOAD', extracted && extracted.trim().length > 0 ? inferSentiment(extracted) : 'NEUTRAL', extracted && extracted.trim().length > 0 ? sentimentScoreFor(inferSentiment(extracted)) : 0.5, inferThemes(extracted || filename), '', 0, new Date().toISOString(), workspaceId]);

  await query('UPDATE workspaces SET feedback_count = (SELECT COUNT(*) FROM feedbacks WHERE workspace_id = workspaces.id)');
  return res.json({ totalRows: 1, importedRows: 1, fileSavedAs: `uploads/${targetName}`, record: inserted.rows[0] });
});

app.get('/api/feedback/stats', authenticate, async (req, res) => {
  const workspaceId = req.query.workspaceId ? Number(req.query.workspaceId) : undefined;
  const rows = await buildStats(workspaceId);
  res.json(rows);
});

app.get('/api/reports', authenticate, async (req, res) => {
  const workspaceId = req.query.workspaceId ? Number(req.query.workspaceId) : undefined;
  const { rows } = workspaceId ? await query('SELECT * FROM reports WHERE workspace_id = $1 ORDER BY created_at DESC', [workspaceId]) : await query('SELECT * FROM reports ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/api/reports/:id', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM reports WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Report not found.' });
  res.json(rows[0]);
});

app.post('/api/reports/generate', authenticate, async (req, res) => {
  try {
    const type = req.body.type || 'WEEKLY';
    const workspaceId = req.body.workspaceId ? Number(req.body.workspaceId) : 1;
    const periodStart = req.body.periodStart || '';
    const periodEnd = req.body.periodEnd || '';
    const title = req.body.title && typeof req.body.title === 'string' ? req.body.title : `${type} report for workspace ${workspaceId}`;
    const summary = req.body.summary || 'This report captures the latest sentiment and theme patterns from the workspace.';

    let insights;
    if (req.body.insights) {
      if (typeof req.body.insights === 'string') {
        insights = req.body.insights;
      } else {
        insights = JSON.stringify(req.body.insights);
      }
    } else {
      insights = JSON.stringify([
        { category: 'Momentum', description: 'Positive sentiment is leading overall conversation volume.', impact: 'HIGH', metrics: { positive: 5 } },
        { category: 'Watchlist', description: 'A few recent entries indicate a need for support follow-up.', impact: 'MEDIUM', metrics: { negative: 2 } },
      ]);
    }

    const result = await query('INSERT INTO reports (title, type, period_start, period_end, summary, insights, status, created_at, workspace_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [
      title,
      type,
      periodStart,
      periodEnd,
      summary,
      insights,
      'COMPLETED',
      new Date().toISOString(),
      workspaceId,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error generating report', err);
    res.status(500).json({ message: 'Failed to generate report.' });
  }
});

app.get('/api/reports/:id/pdf', authenticate, async (req, res) => {
  const { rows } = await query('SELECT * FROM reports WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Report not found.' });
  res.setHeader('Content-Type', 'application/pdf');
  res.send(`%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n4 0 obj<< /Length 44 >>stream\nBT /F1 18 Tf 50 100 Td (${rows[0].title}) Tj ET\nendstream\nendobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000119 00000 n \n0000000206 00000 n \n0000000304 00000 n \ntrailer<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF`);
});

app.delete('/api/reports/:id', authenticate, async (req, res) => {
  await query('DELETE FROM reports WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

async function start() {
  await seedData();
  app.listen(port, () => {
    console.log(`LOOP backend listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
