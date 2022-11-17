FROM condaforge/mambaforge:22.9.0-1 AS conda
COPY environment.yml environment.yml
RUN mamba env create -p /env -f environment.yml && conda clean -afy


FROM ubuntu:22.10
COPY --from=conda /env /env

ENV SIARNAQ_MODE PRODUCTION
ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app
WORKDIR $APP_HOME

COPY uwsgi.ini uwsgi.ini
COPY siarnaq siarnaq
CMD /env/bin/uwsgi --chdir=$APP_HOME --http=:$PORT --ini=uwsgi.ini
