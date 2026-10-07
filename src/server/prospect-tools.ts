import { db } from './database'
import { canonicalToolName, generateToolSummary, type ProspectToolInput } from '../lib/tools'

type Sql = ReturnType<typeof db>

export async function getProspectTools(sql: Sql, prospectId: string) {
  return sql`
    SELECT tools.id, tools.name, tools.summary, tools.website_url, tools.is_osai_stack, tools.is_integratable,
      prospect_tools.active, prospect_tools.notes
    FROM prospect_tools
    JOIN tools ON tools.id = prospect_tools.tool_id
    WHERE prospect_tools.prospect_id = ${prospectId}::uuid
    ORDER BY lower(tools.name)
  `
}

export async function syncProspectTools(sql: Sql, prospectId: string, actorAuthUserId: string, assignments: ProspectToolInput[]) {
  await sql.transaction(transaction => [
    transaction`DELETE FROM prospect_tools WHERE prospect_id = ${prospectId}::uuid`,
    ...assignments.map(assignment => transaction`
      WITH selected_tool AS (
        INSERT INTO tools (name, canonical_name, summary, created_by)
        VALUES (
          ${assignment.name},
          ${canonicalToolName(assignment.name)},
          ${generateToolSummary(assignment.name, false, false)},
          ${actorAuthUserId}
        )
        ON CONFLICT (canonical_name) DO UPDATE SET updated_at = tools.updated_at
        RETURNING id
      )
      INSERT INTO prospect_tools (prospect_id, tool_id, active, notes)
      SELECT ${prospectId}::uuid, id, ${assignment.active}, ${assignment.notes}
      FROM selected_tool
    `),
  ])
}
