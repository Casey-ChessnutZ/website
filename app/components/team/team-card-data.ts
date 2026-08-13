export function getTeamMemberMeta({ federation, location }: { federation?: string; location?: string }): string {
  return [federation, location].filter(Boolean).join(' · ') || 'ChessNutZ team';
}
