"""
ETL Pipeline for Coastal Threat Data
Member 1 – Data Engineer
"""

import requests
import pandas as pd
import geopandas as gpd
import psycopg2
from sqlalchemy import create_engine
import os
import db
from data_fetchers import fetch_all_sources
import uuid

# ======================================================
# 1. SATELLITE DATA (NASA MODIS, ESA Copernicus, ISRO Bhuvan)
# ======================================================

def fetch_nasa_modis():
    # Requires NASA Earthdata login (username/password or token)
    NASA_TOKEN = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6InNocnV0aV9wYXRlbDE4IiwiZXhwIjoxNzYxNjk1OTk5LCJpYXQiOjE3NTY0OTM3NzYsImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiIsImlkZW50aXR5X3Byb3ZpZGVyIjoiZWRsX29wcyIsImFjciI6ImVkbCIsImFzc3VyYW5jZV9sZXZlbCI6M30.QiT-TAqCbxc3Jwam9Dv9IBdkdOYaW7bdOV-HQhXHPHv7bq2EmZjTbYSSDtcVzWzvxjHjNWIPg3zuaChLE6IaB4CRZ4MfV4Fnu1KDJtEuc8NdX3gN7CmjLJkyRkq4KsOrb63Q6_1DwX8xzjmueM1m---TZeZQChSwZrzubfd_VtykMFqc8uebiIkI72YYNTJDIGwADl9phksaNSiPbJFS3I9NIhqLdRyf8QdUcu8kP5Aety9xXQtRDLvonAPR7-OoZTjk0eMQSg0NhDQj-Pj_dbW5lVvCX2-UJnXSufqA-4wUHbhMlyCRjwUPx2UL865myEker2f_IQoIpV8K7Qt7Xg"
    url = f"https://ladsweb.modaps.eosdis.nasa.gov/api/v1/files?products=MOD09A1&dateRanges=2023-07-01..2023-07-05&token={NASA_TOKEN}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    return None


def fetch_isro_bhuvan():
    # Example WMS request (no API key, but requires login sometimes)
    url = "https://bhuvan-app1.nrsc.gov.in/bhuvan/wms?service=WMS&request=GetCapabilities"
    resp = requests.get(url)
    return resp.text if resp.status_code == 200 else None


# ======================================================
# 2. WEATHER & OCEAN DATA (NOAA, OpenWeather)
# ======================================================

def fetch_noaa_weather():
    NOAA_TOKEN = "MqFikPxBTLcwSnbvkqedtqehcXQbYUhZ"
    headers = {"token": NOAA_TOKEN}
    url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets"
    resp = requests.get(url, headers=headers)
    return resp.json() if resp.status_code == 200 else None

def fetch_openweather(city="Mumbai"):
    OPENWEATHER_KEY = "b6bd9cf0623f02021f2a138ecbe03078"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_KEY}"
    resp = requests.get(url)
    return resp.json() if resp.status_code == 200 else None


# ======================================================
# 3. AIS SHIP TRACKING (Global Fishing Watch)
# ======================================================

def fetch_global_fishing():
    GFW_API_KEY = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJhcGkiLCJ1c2VySWQiOjQ5Nzg4LCJhcHBsaWNhdGlvbk5hbWUiOiJhcGkiLCJpZCI6MzIwMSwidHlwZSI6InVzZXItYXBwbGljYXRpb24ifSwiaWF0IjoxNzU2NTAxOTIwLCJleHAiOjIwNzE4NjE5MjAsImF1ZCI6ImdmdyIsImlzcyI6ImdmdyJ9.mOSkpLRlq-2QojWVK7-gZEbVDe0n9R6FtRfONrTDz_OjwjVrESdvaIH6EWlw8pS2sd7RZbhBgd_Y2qPs7Ou2Fw4jw9P7TrbXrhTl2Kd9JNpSNkJJgWxNXhSA0R7fDcU4QkOppkI2FSaafWAMV70-xLwqtzh3Ku4J9XYRlWyj-M7Lr9LRdEuO_Nn_LlVPoHHoKdwCtM4kFuAykQGl8Qlehx1OHzejM5dpiAB2Pwarntmi07h4E3Zn7HN61FbacbWr87s_l6IavWLMVVHwJFjHIVrO4oeCYwuLskHMLSm10gbaFbEEvitoT80ntaNg3lCXrySCpFLEWG8whPI9_xlnNwJYhER2bxCAPLJLj39JCxoy7XOh9f6ex7wJ6ZRwT6XxGMX15vGHz6Fp8XJ_f5U7DLSWZAD7jIxfuIDs1ABLH1JX46gJKc8TwGr_A5zdzB7CvlrbPArw-jpQfnKkV1xZmbzKOvzn75NadEPcAwfl_CelyFOMA7KpLCQgFiDav-Hs"
    url = f"https://gateway.api.globalfishingwatch.org/v1/vessels?limit=5&api-key={GFW_API_KEY}"
    resp = requests.get(url)
    return resp.json() if resp.status_code == 200 else None


# ======================================================
# 4. LOAD TO DATABASE (PostgreSQL + PostGIS)
# ======================================================

def load_to_postgres(data, table_name):
    DB_USER = "postgres"
    DB_PASS = "password"
    DB_HOST = "localhost"
    DB_PORT = "5432"
    DB_NAME = "coastal_db"

    engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    
    if isinstance(data, dict):
        df = pd.json_normalize(data)
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        print(f"Unsupported data format for {table_name}")
        return
    
    df.to_sql(table_name, engine, if_exists="append", index=False)
    print(f"✅ Loaded {len(df)} records into {table_name}")


# ======================================================
# 5. MAIN PIPELINE
# ======================================================

def main():
    # print("🚀 Starting ETL Pipeline...")

    # # 1. Satellite
    # nasa_data = fetch_nasa_modis()
    # # esa_data = fetch_esa_copernicus()
    # bhuvan_data = fetch_isro_bhuvan()

    # # 2. Weather
    # noaa_data = fetch_noaa_weather()
    # ow_data = fetch_openweather("Mumbai")

    # # 3. Ship tracking
    # gfw_data = fetch_global_fishing()

    # # 4. Load into DB
    # if nasa_data: load_to_postgres(nasa_data, "nasa_modis")
    # # if esa_data: load_to_postgres(esa_data.get("features", []), "esa_copernicus")
    # if noaa_data: load_to_postgres(noaa_data.get("results", []), "noaa_weather")
    # if ow_data: load_to_postgres([ow_data], "openweather")
    # if gfw_data: load_to_postgres(gfw_data.get("data", []), "gfw_ships")

    # print("🎯 ETL Pipeline Completed.")
    print("🚀 Starting ETL Pipeline...")
    # initialize DB (creates tables & postgis if needed)
    db.init_db()
    run_id = str(uuid.uuid4())
    print(f"📦 Run ID: {run_id}")

#     # 1. NASA MODIS
#     nasa_data = fetch_nasa_modis()
#     if nasa_data:
#         # nasa_data might be a dict with nested files -> wrap or normalize as you want
#         # for now store raw JSON
#         db.insert_json_rows("nasa_modis", [nasa_data] if isinstance(nasa_data, dict) else nasa_data)

#     # 2. ISRO Bhuvan (GetCapabilities returns XML text - we'll store raw text)
#     bhuvan_data = fetch_isro_bhuvan()
#     if bhuvan_data:
#         # store as a single JSON object with the raw xml as string
#         db.insert_json_rows("isro_bhuvan", [{"xml": bhuvan_data}])

#     # 3. NOAA
#     noaa_data = fetch_noaa_weather()
#     if noaa_data:
#         # NOAA often returns {"results": [...]} so handle both
#         results = noaa_data.get("results") if isinstance(noaa_data, dict) else None
#         if results:
#             db.insert_json_rows("noaa_weather", results)
#         else:
#             db.insert_json_rows("noaa_weather", [noaa_data])

#     # 4. OpenWeather
#     ow_data = fetch_openweather("Mumbai")
#     if ow_data:
#         db.insert_json_rows("openweather", [ow_data])

#     # 5. Global Fishing Watch (AIS)
#     gfw_data = fetch_global_fishing()
#     if gfw_data:
#         # GFW may return {"data": [...]} depending on endpoint
#         records = gfw_data.get("data") if isinstance(gfw_data, dict) else gfw_data
#         if isinstance(records, list):
#             db.insert_gfw_ships(records)
#         else:
#             # fallback: store raw
#             db.insert_json_rows("gfw_ships", [gfw_data])

#     print("🎯 ETL Pipeline Completed.")

# if __name__ == "__main__":
#     # main()

 # 1. NASA MODIS
    nasa_data = fetch_nasa_modis()
    if nasa_data:
        db.insert_json_rows("nasa_modis", [nasa_data] if isinstance(nasa_data, dict) else nasa_data, run_id)

    # 2. ISRO Bhuvan
    bhuvan_data = fetch_isro_bhuvan()
    if bhuvan_data:
        db.insert_json_rows("isro_bhuvan", [{"xml": bhuvan_data}], run_id)

    # 3. NOAA
    noaa_data = fetch_noaa_weather()
    if noaa_data:
        results = noaa_data.get("results") if isinstance(noaa_data, dict) else None
        if results:
            db.insert_json_rows("noaa_weather", results, run_id)
        else:
            db.insert_json_rows("noaa_weather", [noaa_data], run_id)

    # 4. OpenWeather
    ow_data = fetch_openweather("Mumbai")
    if ow_data:
        db.insert_json_rows("openweather", [ow_data], run_id)

    # 5. Global Fishing Watch (AIS)
    gfw_data = fetch_global_fishing()
    if gfw_data:
        records = gfw_data.get("data") if isinstance(gfw_data, dict) else gfw_data
        if isinstance(records, list):
            db.insert_gfw_ships(records, run_id)
        else:
            db.insert_json_rows("gfw_ships", [gfw_data], run_id)

    print("🎯 ETL Pipeline Completed.")

if __name__ == "__main__":
    main()