# # db.py
# import os
# import json
# from dotenv import load_dotenv
# import psycopg2
# from psycopg2.extras import execute_values
# from sqlalchemy import create_engine, text

# load_dotenv()

# DB_USER = os.getenv("DB_USER", "postgres")
# DB_PASS = os.getenv("DB_PASS", "kp1234")
# DB_HOST = os.getenv("DB_HOST", "localhost")
# DB_PORT = os.getenv("DB_PORT", "5432")
# DB_NAME = os.getenv("DB_NAME", "coastal_alert")

# # SQLAlchemy engine (used for ad-hoc queries if needed)
# ENGINE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# engine = create_engine(ENGINE_URL, pool_pre_ping=True)

# # psycopg2 connection parameters (used for fast inserts & DDL)
# PSYCOPG2_CONN = {
#     "host": DB_HOST,
#     "dbname": DB_NAME,
#     "user": DB_USER,
#     "password": DB_PASS,
#     "port": DB_PORT
# }

# def init_db():
#     """Create PostGIS extension and necessary tables if not present."""
#     conn = psycopg2.connect(**PSYCOPG2_CONN)
#     conn.autocommit = True
#     cur = conn.cursor()

#     # Enable PostGIS
#     cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

#     # Basic JSON tables for APIs
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS nasa_modis (
#         id SERIAL PRIMARY KEY,
#         ingestion_time TIMESTAMP DEFAULT now(),
#         data JSONB
#     );
#     """)
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS isro_bhuvan (
#         id SERIAL PRIMARY KEY,
#         ingestion_time TIMESTAMP DEFAULT now(),
#         data JSONB
#     );
#     """)
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS noaa_weather (
#         id SERIAL PRIMARY KEY,
#         ingestion_time TIMESTAMP DEFAULT now(),
#         data JSONB
#     );
#     """)
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS openweather (
#         id SERIAL PRIMARY KEY,
#         ingestion_time TIMESTAMP DEFAULT now(),
#         data JSONB
#     );
#     """)

#     # AIS / GFW with spatial point and index
#     cur.execute("""
#     CREATE TABLE IF NOT EXISTS gfw_ships (
#         id SERIAL PRIMARY KEY,
#         ingestion_time TIMESTAMP DEFAULT now(),
#         mmsi TEXT,
#         latitude DOUBLE PRECISION,
#         longitude DOUBLE PRECISION,
#         geom geometry(Point,4326),
#         data JSONB
#     );
#     """)
#     # spatial index for fast geo queries
#     cur.execute("CREATE INDEX IF NOT EXISTS idx_gfw_geom ON gfw_ships USING GIST (geom);")

#     cur.close()
#     conn.close()
#     print("✅ DB initialized (extensions + tables ready).")


# def insert_json_rows(table_name, dict_list):
#     """Insert list of dicts into 'table_name' into column `data` (JSONB)."""
#     if not dict_list:
#         return
#     conn = psycopg2.connect(**PSYCOPG2_CONN)
#     cur = conn.cursor()
#     sql = f"INSERT INTO {table_name} (data) VALUES %s"
#     tuples = [(json.dumps(d),) for d in dict_list]
#     # Use template to cast text to jsonb
#     execute_values(cur, sql, tuples, template="(%s::jsonb)")
#     conn.commit()
#     cur.close()
#     conn.close()
#     print(f"Inserted {len(dict_list)} rows into {table_name}")


# def insert_gfw_ships(records):
#     """Insert GFW AIS records into gfw_ships table. Expects list of record dicts.
#        Each record should have latitude/longitude and optionally mmsi.
#     """
#     if not records:
#         return
#     conn = psycopg2.connect(**PSYCOPG2_CONN)
#     cur = conn.cursor()
#     sql = """
#     INSERT INTO gfw_ships (mmsi, latitude, longitude, geom, data)
#     VALUES %s
#     """
#     tuples = []
#     for r in records:
#         # adapt keys to your GFW response format
#         mmsi = r.get("mmsi") or r.get("properties", {}).get("mmsi") or None
#         lat = r.get("latitude") or r.get("lat") or (r.get("properties",{}).get("latitude"))
#         lon = r.get("longitude") or r.get("lon") or (r.get("properties",{}).get("longitude"))
#         # skip malformed rows
#         if lat is None or lon is None:
#             continue
#         # ST_MakePoint expects (lon, lat)
#         data_json = json.dumps(r)
#         tuples.append((mmsi, lat, lon, lon, lat, data_json))

#     # template uses ST_SetSRID(ST_MakePoint(%s, %s),4326) for geom
#     template = "(%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s::jsonb)"
#     execute_values(cur, sql, tuples, template=template)
#     conn.commit()
#     cur.close()
#     conn.close()
#     print(f"Inserted {len(tuples)} ship rows into gfw_ships")





# db.py
import os
import json
import uuid
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values
from sqlalchemy import create_engine

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "kp1234")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "coastal_alert")

ENGINE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(ENGINE_URL, pool_pre_ping=True)

PSYCOPG2_CONN = {
    "host": DB_HOST,
    "dbname": DB_NAME,
    "user": DB_USER,
    "password": DB_PASS,
    "port": DB_PORT
}

def init_db():
    """Create PostGIS extension and necessary tables if not present."""
    conn = psycopg2.connect(**PSYCOPG2_CONN)
    conn.autocommit = True
    cur = conn.cursor()

    # Enable PostGIS
    cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # JSON API tables (with run_id for archiving)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS nasa_modis (
        id SERIAL PRIMARY KEY,
        run_id UUID DEFAULT gen_random_uuid(),
        ingestion_time TIMESTAMP DEFAULT now(),
        data JSONB
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS isro_bhuvan (
        id SERIAL PRIMARY KEY,
        run_id UUID DEFAULT gen_random_uuid(),
        ingestion_time TIMESTAMP DEFAULT now(),
        data JSONB
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS noaa_weather (
        id SERIAL PRIMARY KEY,
        run_id UUID DEFAULT gen_random_uuid(),
        ingestion_time TIMESTAMP DEFAULT now(),
        data JSONB
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS openweather (
        id SERIAL PRIMARY KEY,
        run_id UUID DEFAULT gen_random_uuid(),
        ingestion_time TIMESTAMP DEFAULT now(),
        data JSONB
    );
    """)

    # AIS / GFW with spatial point and index
    cur.execute("""
    CREATE TABLE IF NOT EXISTS gfw_ships (
        id SERIAL PRIMARY KEY,
        run_id UUID DEFAULT gen_random_uuid(),
        ingestion_time TIMESTAMP DEFAULT now(),
        mmsi TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        geom geometry(Point,4326),
        data JSONB
    );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_gfw_geom ON gfw_ships USING GIST (geom);")

    cur.close()
    conn.close()
    print("✅ DB initialized (extensions + tables ready).")


def insert_json_rows(table_name, dict_list, run_id=None):
    """Insert list of dicts into table_name with run_id + data (JSONB)."""
    if not dict_list:
        return
    if run_id is None:
        run_id = str(uuid.uuid4())  # fallback if not passed

    conn = psycopg2.connect(**PSYCOPG2_CONN)
    cur = conn.cursor()
    sql = f"INSERT INTO {table_name} (run_id, data) VALUES %s"
    tuples = [(run_id, json.dumps(d)) for d in dict_list]
    execute_values(cur, sql, tuples, template="(%s, %s::jsonb)")
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted {len(dict_list)} rows into {table_name} with run_id {run_id}")


def insert_gfw_ships(records, run_id=None):
    """Insert GFW AIS records into gfw_ships table with run_id."""
    if not records:
        return
    if run_id is None:
        run_id = str(uuid.uuid4())

    conn = psycopg2.connect(**PSYCOPG2_CONN)
    cur = conn.cursor()
    sql = """
    INSERT INTO gfw_ships (run_id, mmsi, latitude, longitude, geom, data)
    VALUES %s
    """
    tuples = []
    for r in records:
        mmsi = r.get("mmsi") or r.get("properties", {}).get("mmsi") or None
        lat = r.get("latitude") or r.get("lat") or (r.get("properties",{}).get("latitude"))
        lon = r.get("longitude") or r.get("lon") or (r.get("properties",{}).get("longitude"))
        if lat is None or lon is None:
            continue
        data_json = json.dumps(r)
        tuples.append((run_id, mmsi, lat, lon, lon, lat, data_json))

    template = "(%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s::jsonb)"
    execute_values(cur, sql, tuples, template=template)
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted {len(tuples)} ship rows into gfw_ships with run_id {run_id}")
