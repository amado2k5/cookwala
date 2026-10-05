// Problem documents (application/problem+json) as an error, the same shape as sdk/python.

export class CookwalaProblem extends Error {
  constructor(status, body) {
    body = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
    const title = body.title ?? 'problem';
    super(`${status} ${title}: ${body.detail || ''}`.trim());
    this.name = 'CookwalaProblem';
    this.status = status;
    this.title = title;
    this.detail = body.detail ?? null;
    this.refusal = body.refusal ?? null;
    this.body = body;
  }
}

export function problem(status, title, detail = null, refusal = null) {
  const body = { type: `https://cookwala.ai/errors/${title}`, title };
  if (detail) body.detail = detail;
  if (refusal) body.refusal = refusal;
  return new CookwalaProblem(status, body);
}
