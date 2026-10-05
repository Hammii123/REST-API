const settingsService = require('../services/settings.service');
const {
  validateCreate,
  validateUpdate,
  validateUserId,
} = require('../utils/validate');

function serverError(res, err) {
  console.error('Unexpected error:', err.message);
  return res.status(500).json({ error: 'Internal server error' });
}

async function getSettings(req, res) {
  const errors = validateUserId(req.params.userId);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const settings = await settingsService.getByUserId(req.params.userId);
    if (!settings) return res.status(404).json({ error: 'User settings not found' });

    return res.status(200).json(settings);
  } catch (err) {
    return serverError(res, err);
  }
}

async function createSettings(req, res) {
  const errors = validateCreate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const created = await settingsService.create(req.body);
    console.log(`[CREATE] Settings created for user: ${created.userId}`);

    return res.status(201).json(created);
  } catch (err) {
    if (err.code === 'DUPLICATE_USER') {
      return res.status(409).json({ error: err.message });
    }
    return serverError(res, err);
  }
}

async function updateSettings(req, res) {
  const errors = [...validateUserId(req.params.userId), ...validateUpdate(req.body)];
  if (errors.length) return res.status(400).json({ errors });

  try {
    const updated = await settingsService.update(req.params.userId, req.body);
    if (!updated) return res.status(404).json({ error: 'User settings not found' });

    console.log(`[UPDATE] Settings updated for user: ${updated.userId}`);
    return res.status(200).json(updated);
  } catch (err) {
    return serverError(res, err);
  }
}

async function deleteSettings(req, res) {
  const errors = validateUserId(req.params.userId);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const deleted = await settingsService.remove(req.params.userId);
    if (!deleted) return res.status(404).json({ error: 'User settings not found' });

    console.log(`[DELETE] Settings deleted for user: ${deleted.userId}`);
    return res.status(200).json({ message: 'User settings deleted', settings: deleted });
  } catch (err) {
    return serverError(res, err);
  }
}

module.exports = { getSettings, createSettings, updateSettings, deleteSettings };