// Is an action inside an AgentMandate? Port of check_mandate in sdk/mcp/cookwala_mcp.py.
export function checkMandate(m, action, amount, provider, now) {
  const reasons = [];
  if (action === 'irreversible' || action === 'safety_override') return { allowed: false, needsConfirmation: true, reasons: ['always_confirm'] };
  if (!(m.scopes || []).includes(action)) reasons.push('scope_missing');
  if (now && m.expires && new Date(now) > new Date(m.expires)) reasons.push('expired');
  if (provider && (m.allowedProviders || []).length && !m.allowedProviders.includes(provider)) reasons.push('provider_not_allowed');
  if (amount !== undefined && amount !== null) {
    const amt = Number(amount);
    const cap = m.perOrderCap || m.spendCap;
    if (!Number.isFinite(amt)) reasons.push('bad_amount');
    else if (cap && cap.amount !== undefined) { if (amt > Number(cap.amount)) reasons.push('over_cap'); }
  }
  const confirm = (m.confirmBefore || []).includes(action);
  return { allowed: reasons.length === 0, needsConfirmation: confirm || reasons.length > 0, reasons };
}
