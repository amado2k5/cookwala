"""Azure Functions (Python v2 programming model): the Cookwala samples service as one HTTP function.

    func start                                   # local, with Azure Functions Core Tools
    func azure functionapp publish <app-name>    # or deploy main.bicep, then publish

Every route under /api/ is passed to cookwala_samples.service, so the endpoints are the same as the
container: /api/health, /api/v1/samples, /api/v1/samples/gates, /plan, /run, /demo.
"""
from urllib.parse import urlencode

import azure.functions as func

from cookwala_samples.service import handle_raw

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)


@app.route(route='{*path}', methods=['GET', 'POST'])
def samples(req: func.HttpRequest) -> func.HttpResponse:
    path = '/' + req.route_params.get('path', '')
    query = ('?' + urlencode(dict(req.params))) if req.params else ''
    status, ctype, text = handle_raw(req.method, path + query, req.get_body())
    return func.HttpResponse(text, status_code=status, mimetype=ctype.split(';')[0], charset='utf-8')
