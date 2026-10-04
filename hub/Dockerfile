FROM python:3.12-slim
WORKDIR /cookwala
COPY tools/cookwala_ref.py tools/
COPY vocab/ vocab/
COPY profiles/ profiles/
COPY examples/ examples/
COPY hub/cookwala_hub.py hub/
EXPOSE 7878
ENTRYPOINT ["python", "hub/cookwala_hub.py", "--port", "7878"]
