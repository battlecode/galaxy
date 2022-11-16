FROM condaforge/mambaforge:22.9.0-1 AS conda

COPY environment.yml .
RUN mamba env create -p /env -f environment.yml && conda clean -afy

FROM ubuntu:22.10

COPY --from=conda /env /env

WORKDIR /app
COPY uwsgi.ini uwsgi.ini
COPY siarnaq siarnaq
CMD ["/env/bin/uwsgi", "--chdir=/app", "--uid=www-data", "--ini=uwsgi.ini"]
