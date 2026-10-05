"""AWS Lambda handler: the Cookwala samples service behind a Function URL or API Gateway (HTTP API, payload 2.0; REST API, payload 1.0).

    sam build && sam deploy --guided           # template.yaml
"""
import base64
from urllib.parse import urlencode

from cookwala_samples.service import handle_raw


def handler(event, context=None):
    http = (event.get('requestContext') or {}).get('http') or {}
    method = http.get('method') or event.get('httpMethod') or 'GET'
    path = event.get('rawPath') or event.get('path') or '/'
    stage = (event.get('requestContext') or {}).get('stage')
    if stage and stage != '$default' and path.startswith(f'/{stage}/'):
        path = path[len(stage) + 1:]
    qs = event.get('rawQueryString') or urlencode(event.get('queryStringParameters') or {})
    body = event.get('body') or ''
    raw = base64.b64decode(body) if event.get('isBase64Encoded') else body.encode('utf-8')
    status, ctype, text = handle_raw(method, path + (f'?{qs}' if qs else ''), raw)
    return {'statusCode': status, 'headers': {'Content-Type': ctype}, 'body': text, 'isBase64Encoded': False}
