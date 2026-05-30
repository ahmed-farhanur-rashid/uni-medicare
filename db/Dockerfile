FROM postgres:16-alpine
COPY schema.sql      /docker-entrypoint-initdb.d/01_schema.sql
COPY functions.sql   /docker-entrypoint-initdb.d/02_functions.sql
COPY triggers.sql    /docker-entrypoint-initdb.d/03_triggers.sql
COPY seed.sql        /docker-entrypoint-initdb.d/04_seed.sql
