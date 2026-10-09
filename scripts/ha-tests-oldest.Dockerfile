# The image of scripts/ha-tests.Dockerfile with the oldest supported Home
# Assistant (requirements-dev-oldest.txt). Build and run it with
# scripts/test-ha.ps1 -Oldest.
FROM python:3.14-slim
WORKDIR /src
COPY requirements-dev-oldest.txt .
RUN pip install --no-cache-dir -r requirements-dev-oldest.txt
CMD ["pytest", "-q", "-p", "no:cacheprovider"]
