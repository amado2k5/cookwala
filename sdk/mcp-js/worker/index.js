import { handleRequest } from '../src/http.js';
import { VERSION } from '../src/server.js';
import pkg from '../package.json' with { type: 'json' };

export default {
  fetch: (request, env) => handleRequest(request, env, { version: pkg.version || VERSION }),
};
