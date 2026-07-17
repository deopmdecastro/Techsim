import { Router } from 'express';
import { LIBS, MODS_ALL, MODULE_PRESETS } from '../../../src/data/modules.js';
import { cacheJson, readCachedJson } from '../services/cache.js';

const router = Router();
const CACHE_KEY = 'libraries:v1';

router.get('/libraries', async (_req, res) => {
  const cached = await readCachedJson(CACHE_KEY);
  if (cached) {
    return res.json(cached);
  }

  const payload = { modules: MODS_ALL, libraries: LIBS, presets: MODULE_PRESETS };
  await cacheJson(CACHE_KEY, 3600, payload);
  return res.json(payload);
});

export default router;
