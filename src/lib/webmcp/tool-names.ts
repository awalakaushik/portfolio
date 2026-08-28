// Single allowlist shared by the client registration manager and the
// /api/agent-log endpoint, so the endpoint never stores arbitrary strings.
export const TOOL_NAMES = [
    'get_profile',
    'search_projects',
    'get_experience',
    'get_evidence',
    'match_role',
    'tailor_view',
    'reset_view',
    'generate_resume',
    'compose_inquiry',
    'sign_guestbook',
    'get_guestbook',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];
