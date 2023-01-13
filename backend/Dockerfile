FROM condaforge/mambaforge:22.9.0-1 AS conda
COPY environment.yml environment.yml
RUN mamba env create -p /env -f environment.yml && conda clean -afy


FROM ubuntu:22.10
COPY --from=conda /env /env

ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV SIARNAQ_REVISION=$REVISION_ARG

COPY manage.py manage.py
COPY siarnaq siarnaq
CMD /env/bin/gunicorn --bind=:$PORT --workers=4 --threads=4 --pid=/run/gunicorn.pid --timeout=0 siarnaq.wsgi:application
