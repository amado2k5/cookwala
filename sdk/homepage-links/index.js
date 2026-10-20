// Adds RFC 8288 / RFC 9727 Link headers to the cookwala.ai homepage so agents can find
// the API catalog, service descriptions and the protocol description. Everything else
// passes straight through to the origin unchanged.
const LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</v1/api/index.openapi.yaml>; rel="service-desc"; type="application/yaml"',
  '</docs/REST-API/>; rel="service-doc"; type="text/html"',
  '</.well-known/cookwala.json>; rel="describedby"; type="application/json"',
].join(', ');

export default {
  async fetch(request) {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.append('Link', LINKS);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
