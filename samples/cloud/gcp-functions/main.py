"""Google Cloud Run functions (2nd gen): the Cookwala samples service.

    gcloud functions deploy cookwala-samples --gen2 --runtime=python312 --region=europe-west1 \
      --source=. --entry-point=samples --trigger-http --no-allow-unauthenticated
"""
import functions_framework

from cookwala_samples.service import handle_raw


@functions_framework.http
def samples(request):
    url = request.full_path if request.query_string else request.path
    status, ctype, text = handle_raw(request.method, url, request.get_data())
    return text, status, {'Content-Type': ctype}
