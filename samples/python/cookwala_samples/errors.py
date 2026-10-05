"""Problem documents (application/problem+json) as an exception, the same shape as sdk/python."""


class CookwalaProblem(Exception):
    def __init__(self, status, body):
        body = body if isinstance(body, dict) else {}
        self.status = status
        self.title = body.get('title', 'problem')
        self.detail = body.get('detail')
        self.refusal = body.get('refusal')
        self.body = body
        super().__init__(f'{status} {self.title}: {self.detail or ""}'.strip())


def problem(status, title, detail=None, refusal=None):
    body = {'type': f'https://cookwala.ai/errors/{title}', 'title': title}
    if detail: body['detail'] = detail
    if refusal: body['refusal'] = refusal
    return CookwalaProblem(status, body)
