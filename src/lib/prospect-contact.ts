const NON_DIGIT_PATTERN = /\D/g;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function phoneDigits(value: string) {
  const digits = value.replace(NON_DIGIT_PATTERN, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function formatUsPhoneInput(value: string) {
  const digits = phoneDigits(value).slice(0, 10);
  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizeUsPhone(value: string) {
  if (!value.trim()) return "";
  const digits = phoneDigits(value);
  if (digits.length !== 10) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizeWebsiteUrl(value: string) {
  const input = value.trim();
  if (!input) return "";
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    const labels = url.hostname.split(".");
    if (
      url.protocol !== "http:" && url.protocol !== "https:" ||
      url.username ||
      url.password ||
      labels.length < 2 ||
      labels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))
    ) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeProspectContactRecord<T extends { phone: string; business_phone: string; website_url: string }>(record: T) {
  return {
    ...record,
    phone: normalizeUsPhone(record.phone) ?? record.phone,
    business_phone: normalizeUsPhone(record.business_phone) ?? record.business_phone,
    website_url: normalizeWebsiteUrl(record.website_url) ?? record.website_url,
  } as T;
}
