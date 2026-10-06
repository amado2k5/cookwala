// Vocab loading and transformation — mirrors Python's _vocab() function
// Transforms {entries: [{id: '...', ...}, ...]} → {id: {...}, ...}

export function normalizeVocab(vocab) {
  // If already normalized (direct id→entry map), return as-is
  if (vocab.entries === undefined && !Array.isArray(vocab)) {
    return vocab;
  }
  // If in {entries: [...]} format, transform to {id: entry}
  if (Array.isArray(vocab.entries)) {
    const result = {};
    for (const entry of vocab.entries) {
      result[entry.id] = entry;
    }
    return result;
  }
  // Already in correct format (though missing entries)
  return vocab;
}
