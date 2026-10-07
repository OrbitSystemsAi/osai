import assert from 'node:assert/strict'
import test from 'node:test'
import { formatUsPhoneInput, normalizeProspectContactRecord, normalizeUsPhone, normalizeWebsiteUrl } from '../src/lib/prospect-contact.ts'

test('formats common US phone input consistently', () => {
  assert.equal(formatUsPhoneInput('3865551212'), '(386) 555-1212')
  assert.equal(formatUsPhoneInput('386-555-1212'), '(386) 555-1212')
  assert.equal(formatUsPhoneInput('+1 (386) 555-1212'), '(386) 555-1212')
  assert.equal(formatUsPhoneInput('386'), '(386')
})

test('normalizes complete phone numbers and rejects incomplete numbers', () => {
  assert.equal(normalizeUsPhone('1.386.555.1212'), '(386) 555-1212')
  assert.equal(normalizeUsPhone(''), '')
  assert.equal(normalizeUsPhone('386'), null)
})

test('normalizes bare and www domains to safe HTTPS URLs', () => {
  assert.equal(normalizeWebsiteUrl('example.com'), 'https://example.com/')
  assert.equal(normalizeWebsiteUrl('www.example.com/path'), 'https://www.example.com/path')
  assert.equal(normalizeWebsiteUrl('http://example.com'), 'http://example.com/')
  assert.equal(normalizeWebsiteUrl('javascript:alert(1)'), null)
  assert.equal(normalizeWebsiteUrl('localhost'), null)
})

test('normalizes legacy prospect output without discarding invalid legacy values', () => {
  assert.deepEqual(normalizeProspectContactRecord({ phone: '3865551212', business_phone: '+1 407 555 3434', website_url: 'example.com' }), {
    phone: '(386) 555-1212',
    business_phone: '(407) 555-3434',
    website_url: 'https://example.com/',
  })
})
