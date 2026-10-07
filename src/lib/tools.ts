export type ProspectToolInput = {
  name: string;
  active: boolean;
  notes: string;
};

export function canonicalToolName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function generateToolSummary(name: string, isOsaiStack: boolean, isIntegratable: boolean) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (isOsaiStack && isIntegratable) return `${cleanName} is used in the OSai technology stack and can be integrated into client solutions.`;
  if (isOsaiStack) return `${cleanName} is used as part of the OSai technology stack.`;
  if (isIntegratable) return `${cleanName} can be integrated into OSai client solutions.`;
  return `${cleanName} is tracked in the OSai technology tool dictionary.`;
}

export function parseProspectTools(value: unknown): ProspectToolInput[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 50) return null;
  const seen = new Set<string>();
  const tools: ProspectToolInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim().replace(/\s+/g, " ") : "";
    const notes = typeof record.notes === "string" ? record.notes.trim() : "";
    if (!name || name.length > 120 || notes.length > 1000 || typeof record.active !== "boolean") return null;
    const canonicalName = canonicalToolName(name);
    if (seen.has(canonicalName)) continue;
    seen.add(canonicalName);
    tools.push({ name, active: record.active, notes });
  }
  return tools;
}
