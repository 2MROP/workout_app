import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the real exported JSON file from A7
const exportPath = path.join(__dirname, 'real_export_A7.json');
const rawContent = fs.readFileSync(exportPath, 'utf8');
const backup = JSON.parse(rawContent);

test('backup schema: schemaVersion is 1', () => {
  assert.equal(backup.schemaVersion, 1);
});

test('backup schema: profile contains trackWaist and core fields', () => {
  assert.ok(backup.profile, 'profile object exists');
  assert.equal(typeof backup.profile.age, 'number');
  assert.equal(typeof backup.profile.height, 'number');
  assert.equal(typeof backup.profile.goalWeight, 'number');
  assert.equal(typeof backup.profile.trackWaist, 'boolean');
});

test('backup schema: top-level log dictionaries are date-keyed (YYYY-MM-DD)', () => {
  const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

  ['workoutLogs', 'weightLogs', 'waistLogs', 'nutritionLogs', 'stepLogs', 'cardioLogs'].forEach(logKey => {
    assert.ok(backup[logKey] && typeof backup[logKey] === 'object', `${logKey} exists`);
    Object.keys(backup[logKey]).forEach(dateStr => {
      assert.match(dateStr, dateKeyRegex, `${logKey} key ${dateStr} is formatted YYYY-MM-DD`);
    });
  });
});

test('backup schema: nutritionLogs meal slots contain text + chips (no numeric grams)', () => {
  const dateLogs = backup.nutritionLogs['2026-09-29'];
  assert.ok(dateLogs, 'nutritionLog for 2026-09-29 exists');

  // Verify text notes
  assert.ok(dateLogs.meals, 'meals object exists');
  assert.equal(typeof dateLogs.meals.meal1, 'string');
  assert.equal(dateLogs.meals.meal1, '2 chapathi, dal, chicken curry');

  // Verify protein source chips array
  assert.ok(dateLogs.mealProteins, 'mealProteins object exists');
  assert.ok(Array.isArray(dateLogs.mealProteins.meal1), 'meal1 proteins is array');
  assert.deepEqual(dateLogs.mealProteins.meal1, ['Chicken', 'Dal']);

  // Verify zero bare numeric grams attached to meal slots in nutritionLogs
  const serializedNut = JSON.stringify(dateLogs);
  const bareGramRegex = /:\s*(6|9|20|27)\b/;
  assert.equal(bareGramRegex.test(serializedNut), false, 'No bare gram numbers in nutritionLogs');
});

test('backup schema: meta contains lastExportDate formatted YYYY-MM-DD', () => {
  assert.ok(backup.meta, 'meta object exists');
  assert.match(backup.meta.lastExportDate, /^\d{4}-\d{2}-\d{2}$/);
});

test('backup schema: weightLogs contains correct weight value from A6', () => {
  assert.equal(backup.weightLogs['2026-09-29'], 96.5);
});
