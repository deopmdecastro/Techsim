import { query } from './pool.js';

export async function writeAuditLog({ userId = null, action, entityType, entityId = null, metadata = {} }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [userId, action, entityType, entityId, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Failed to write audit log', error);
  }
}
