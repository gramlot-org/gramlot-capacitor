# Reuse the image built by kajenn/deploy/local-https.
FROM local-https-kajenn:latest
USER root
COPY requirements.txt /tmp/gramlot-requirements.txt
RUN pip install --no-cache-dir --upgrade --upgrade-strategy eager -r /tmp/gramlot-requirements.txt \
    && pip check
USER kajenn
