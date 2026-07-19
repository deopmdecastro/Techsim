import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { invalidateByPrefix } from '../services/cache.js';
import { writeAuditLog } from '../db/audit.js';

const router = Router();

function normalizeProject(row) {
  return {
    id: row.id,
    name: row.name,
    moduleId: row.module_id,
    summary: row.summary,
    viewMode: row.view_mode,
    activePageId: row.active_page_id,
    userEmail: row.email,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    data: row.payload,
  };
}

function normalizePayload(payload = {}, fallbackViewMode = '3d') {
  const pages = Array.isArray(payload.pages) && payload.pages.length
    ? payload.pages.map((page, index) => ({
        id: page.id || `page-${index + 1}`,
        name: page.name || `Página ${index + 1}`,
        layers: Array.isArray(page.layers) && page.layers.length ? page.layers : [{ id: `layer-${index + 1}`, name: 'Base', locked: false, visible: true }],
        currentLayerId: page.currentLayerId || page.layers?.[0]?.id || `layer-${index + 1}`,
        groups: Array.isArray(page.groups) ? page.groups : [],
        comps: Array.isArray(page.comps) ? page.comps : [],
        wires: Array.isArray(page.wires) ? page.wires : [],
      }))
    : [{ id: 'page-1', name: 'Página 1', layers: [{ id: 'layer-1', name: 'Base', locked: false, visible: true }], currentLayerId: 'layer-1', groups: [], comps: payload.comps || [], wires: payload.wires || [] }];

  return {
    pages,
    activePageId: payload.activePageId || pages[0].id,
    favorites: Array.isArray(payload.favorites) ? payload.favorites : [],
    templates: Array.isArray(payload.templates) ? payload.templates : [],
    settings: payload.settings || {},
    viewMode: payload.viewMode || fallbackViewMode,
  };
}

router.use('/projects', requireAuth);

router.get('/projects', async (req, res) => {
  const result = await query(
    `SELECT p.*, u.email
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     WHERE p.owner_id = $1
     ORDER BY p.updated_at DESC`,
    [req.user.sub]
  );

  return res.json({ projects: result.rows.map(normalizeProject) });
});

router.post('/projects', async (req, res) => {
  const { name, moduleId, summary = '', viewMode = '3d', data = {} } = req.body || {};
  if (!name || !moduleId) {
    return res.status(400).json({ message: 'Nome e módulo são obrigatórios.' });
  }

  const payload = normalizePayload(data, viewMode);
  const projectId = uuidv4();
  const result = await query(
    `INSERT INTO projects (id, owner_id, name, module_id, summary, view_mode, active_page_id, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING *, (SELECT email FROM users WHERE id = owner_id) AS email`,
    [projectId, req.user.sub, name, moduleId, summary, payload.viewMode, payload.activePageId, JSON.stringify(payload)]
  );

  await query(
    `INSERT INTO project_versions (project_id, version_no, snapshot, author_id)
     VALUES ($1, 1, $2::jsonb, $3)`,
    [projectId, JSON.stringify(payload), req.user.sub]
  );

  await invalidateByPrefix(`projects:${req.user.sub}:`);
  await writeAuditLog({ userId: req.user.sub, action: 'create', entityType: 'project', entityId: projectId, metadata: { moduleId, name } });
  return res.status(201).json({ project: normalizeProject(result.rows[0]) });
});

router.get('/projects/:id', async (req, res) => {
  const result = await query(
    `SELECT p.*, u.email
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1 AND p.owner_id = $2`,
    [req.params.id, req.user.sub]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: 'Projeto não encontrado.' });
  }

  return res.json({ project: normalizeProject(result.rows[0]) });
});

router.put('/projects/:id', async (req, res) => {
  const { name, summary = '', viewMode = '3d', data = {} } = req.body || {};
  const payload = normalizePayload(data, viewMode);

  const versionResult = await query(
    'SELECT COALESCE(MAX(version_no), 0) AS version_no FROM project_versions WHERE project_id = $1',
    [req.params.id]
  );
  const nextVersion = Number(versionResult.rows[0]?.version_no || 0) + 1;

  const result = await query(
    `UPDATE projects
     SET name = COALESCE($3, name),
         summary = $4,
         view_mode = $5,
         active_page_id = $6,
         payload = $7::jsonb,
         updated_at = NOW()
     WHERE id = $1 AND owner_id = $2
     RETURNING *, (SELECT email FROM users WHERE id = owner_id) AS email`,
    [req.params.id, req.user.sub, name, summary, payload.viewMode, payload.activePageId, JSON.stringify(payload)]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: 'Projeto não encontrado.' });
  }

  await query(
    `INSERT INTO project_versions (project_id, version_no, snapshot, author_id)
     VALUES ($1, $2, $3::jsonb, $4)`,
    [req.params.id, nextVersion, JSON.stringify(payload), req.user.sub]
  );

  await writeAuditLog({ userId: req.user.sub, action: 'update', entityType: 'project', entityId: req.params.id, metadata: { version: nextVersion } });
  return res.json({ project: normalizeProject(result.rows[0]) });
});

router.get('/projects/:id/versions', async (req, res) => {
  const result = await query(
    `SELECT v.id, v.version_no, v.created_at, u.name AS author_name
     FROM project_versions v
     LEFT JOIN users u ON u.id = v.author_id
     JOIN projects p ON p.id = v.project_id
     WHERE v.project_id = $1 AND p.owner_id = $2
     ORDER BY v.version_no DESC`,
    [req.params.id, req.user.sub]
  );

  return res.json({ versions: result.rows.map(row => ({
    id: row.id,
    version: row.version_no,
    createdAt: row.created_at,
    author: row.author_name || 'Sistema',
  })) });
});

router.post('/projects/:id/comments', async (req, res) => {
  const { body, pageId = null } = req.body || {};
  if (!body?.trim()) {
    return res.status(400).json({ message: 'Comentário vazio.' });
  }

  const result = await query(
    `INSERT INTO project_comments (project_id, author_id, page_id, body)
     SELECT $1, $2, $3, $4
     WHERE EXISTS (SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2)
     RETURNING id, project_id, page_id, body, created_at`,
    [req.params.id, req.user.sub, pageId, body.trim()]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: 'Projeto não encontrado.' });
  }

  return res.status(201).json({ comment: result.rows[0] });
});

router.get('/projects/:id/comments', async (req, res) => {
  const result = await query(
    `SELECT c.id, c.page_id, c.body, c.created_at, u.name AS author_name
     FROM project_comments c
     LEFT JOIN users u ON u.id = c.author_id
     JOIN projects p ON p.id = c.project_id
     WHERE c.project_id = $1 AND p.owner_id = $2
     ORDER BY c.created_at DESC`,
    [req.params.id, req.user.sub]
  );
  return res.json({ comments: result.rows.map(row => ({
    id: row.id,
    pageId: row.page_id,
    body: row.body,
    createdAt: row.created_at,
    author: row.author_name || 'Sistema',
  })) });
});

export default router;
