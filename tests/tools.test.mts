import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalToolName, generateToolSummary, parseProspectTools } from '../src/lib/tools.ts'

test('canonicalToolName normalizes casing and whitespace', () => {
  assert.equal(canonicalToolName('  Google   Workspace '), 'google workspace')
})

test('generateToolSummary reflects stack and integration classifications', () => {
  assert.match(generateToolSummary('Zapier', true, true), /used in the OSai technology stack/)
  assert.match(generateToolSummary('Zapier', true, true), /integrated into client solutions/)
})

test('parseProspectTools validates and deduplicates typed tool assignments', () => {
  assert.deepEqual(parseProspectTools([
    { name: 'Slack', active: true, notes: 'Internal chat' },
    { name: ' slack ', active: false, notes: 'Duplicate' },
  ]), [{ name: 'Slack', active: true, notes: 'Internal chat' }])
  assert.equal(parseProspectTools([{ name: '', active: true, notes: '' }]), null)
  assert.equal(parseProspectTools('Slack'), null)
})
