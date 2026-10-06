// Explain one recipe step: operation, physical envelope, hazards, human instruction (as data).
export function explainStep(vocab, recipe, nodeId, lang = 'en') {
  const nodes = ((recipe.process || {}).nodes) || [];
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return { error: 'node_not_found', nodes: nodes.map((n) => n.id) };
  const op = vocab.ops[node.op] || {};
  const env = op.envelope || {};
  const label = (op.label && (op.label[lang] || op.label.en)) || undefined;
  const text = ((recipe.text || {})[lang] || (recipe.text || {}).en || {});
  return {
    node: node.id, op: node.op, label, definition: op.definition, envelope: env, params: node.params || {},
    until: node.until, onTimeout: node.onTimeout, hazards: node.hazards || [], ccp: node.ccp,
    unattendedAllowed: env.unattended !== false, instruction: (text.steps || {})[node.id], instructionIsData: true,
  };
}

export function listOperations(vocab, family, lang = 'en') {
  return Object.values(vocab.ops)
    .filter((e) => !family || (e.classes || []).some((c) => c.includes(family)))
    .map((e) => ({ id: e.id, label: (e.label && (e.label[lang] || e.label.en)) || e.id, definition: e.definition, envelope: e.envelope }));
}
