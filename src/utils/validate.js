const LANGUAGES = ['EN', 'UR'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidTimezone(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    // Throws a RangeError if the timezone is not a valid IANA name
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// Each field check returns an error message, or null if the value is fine
function checkLanguage(value) {
  return LANGUAGES.includes(value)
    ? null
    : `language must be one of: ${LANGUAGES.join(', ')}`;
}

function checkNotifications(value) {
  return typeof value === 'boolean'
    ? null
    : 'notificationsEnabled must be a boolean (true or false)';
}

function checkTimezone(value) {
  return isValidTimezone(value)
    ? null
    : 'timezone must be a valid timezone string (e.g. "Asia/Karachi")';
}

function isPlainObject(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

// POST: every field is required
function validateCreate(body) {
  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const errors = [];

  if (!isNonEmptyString(body.userId)) {
    errors.push('userId is required and must be a non-empty string');
  }

  const checks = [
    checkLanguage(body.language),
    checkNotifications(body.notificationsEnabled),
    checkTimezone(body.timezone),
  ];
  checks.forEach((e) => e && errors.push(e));

  return errors;
}

// PUT: fields are optional, but at least one must be sent and each must be valid
function validateUpdate(body) {
  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const errors = [];
  const hasLanguage = body.language !== undefined;
  const hasNotifications = body.notificationsEnabled !== undefined;
  const hasTimezone = body.timezone !== undefined;

  if (!hasLanguage && !hasNotifications && !hasTimezone) {
    return ['Provide at least one field to update: language, notificationsEnabled, timezone'];
  }

  if (body.userId !== undefined) errors.push('userId cannot be changed');
  if (hasLanguage) errors.push(checkLanguage(body.language));
  if (hasNotifications) errors.push(checkNotifications(body.notificationsEnabled));
  if (hasTimezone) errors.push(checkTimezone(body.timezone));

  return errors.filter(Boolean);
}

// For the :userId URL param on GET / PUT / DELETE
function validateUserId(userId) {
  return isNonEmptyString(userId) ? [] : ['userId must be a non-empty string'];
}

module.exports = { validateCreate, validateUpdate, validateUserId };