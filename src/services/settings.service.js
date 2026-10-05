const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', '..', 'data', 'userSettings.json');

// ---------- Low-level file helpers ----------

async function readAll() {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    // File doesn't exist yet: treat as empty list
    if (err.code === 'ENOENT') return [];
    console.error('Failed to read settings file:', err.message);
    throw new Error('Could not read settings data');
  }
}

async function writeAll(settings) {
  try {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write settings file:', err.message);
    throw new Error('Could not save settings data');
  }
}

// ---------- Service functions (each reads the file once) ----------

async function getByUserId(userId) {
  const all = await readAll();
  return all.find((s) => s.userId === userId) || null;
}

async function create(data) {
  const all = await readAll();

  if (all.some((s) => s.userId === data.userId)) {
    const err = new Error('userId already exists');
    err.code = 'DUPLICATE_USER';
    throw err;
  }

  const now = new Date().toISOString();
  const newSettings = {
    userId: data.userId,
    language: data.language,
    notificationsEnabled: data.notificationsEnabled,
    timezone: data.timezone,
    createdAt: now,
    updatedAt: now,
  };

  all.push(newSettings);
  await writeAll(all);
  return newSettings;
}

async function update(userId, changes) {
  const all = await readAll();
  const index = all.findIndex((s) => s.userId === userId);

  if (index === -1) return null; // controller turns this into a 404

  // Only these fields can change; userId and createdAt are protected
  const allowed = ['language', 'notificationsEnabled', 'timezone'];
  for (const key of allowed) {
    if (changes[key] !== undefined) all[index][key] = changes[key];
  }
  all[index].updatedAt = new Date().toISOString();

  await writeAll(all);
  return all[index];
}

async function remove(userId) {
  const all = await readAll();
  const index = all.findIndex((s) => s.userId === userId);

  if (index === -1) return null;

  const [deleted] = all.splice(index, 1);
  await writeAll(all);
  return deleted;
}

module.exports = { getByUserId, create, update, remove };