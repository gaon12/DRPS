import sys
import os
import time
import requests
from datetime import datetime
import pluscodes

def format_response(status_code, message, summary, data=None):
    response = {
        "statusCode": status_code,
        "message": message,
        "RequestTime": datetime.utcnow().isoformat()
    }
    if data is not None:
        response["data"] = {"summary": summary, **data}
    return response

def geocode(lat, lon, lang, api_key):
    try:
        url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
        headers = {"Authorization": f"KakaoAK {api_key}"}
        params = {"x": lon, "y": lat, "input_coord": "WGS84"}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()

        if response.status_code == 200 and result.get("documents"):
            location = result["documents"][0]
            address = location["address"]["address_name"]
            summary = {
                "latitude": lat,
                "longitude": lon,
                "address": address,
                "plus_code": pluscodes.encode(lat, lon)
            }
            response_data = format_response(200, "Geocode successful", summary, location)
            return response_data, 200
        else:
            response_data = format_response(404, "Geocode result not found", {})
            return response_data, 404
    except Exception as e:
        response_data = format_response(500, "Geocode failed", {})
        return response_data, 500

def reverse_geocode(address, lang, api_key):
    try:
        url = "https://dapi.kakao.com/v2/local/search/address.json"
        headers = {"Authorization": f"KakaoAK {api_key}"}
        params = {"query": address}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()

        if response.status_code == 200 and result.get("documents"):
            location = result["documents"][0]
            lat = location["y"]
            lon = location["x"]
            summary = {
                "latitude": lat,
                "longitude": lon,
                "address": address,
                "plus_code": pluscodes.encode(float(lat), float(lon))
            }
            response_data = format_response(200, "Reverse geocode successful", summary, location)
            return response_data, 200
        else:
            response_data = format_response(404, "Reverse geocode result not found", {})
            return response_data, 404
    except Exception as e:
        response_data = format_response(500, "Reverse geocode failed", {})
        return response_data, 500

def convert_pluscode(pluscode_value, api_key):
    try:
        coordinates = pluscodes.decode(pluscode_value)
        lat = coordinates[0]
        lon = coordinates[1]
        url = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
        headers = {"Authorization": f"KakaoAK {api_key}"}
        params = {"x": lon, "y": lat, "input_coord": "WGS84"}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        address = result["documents"][0]["address"]["address_name"] if result.get("documents") else None
        summary = {
            "latitude": lat,
            "longitude": lon,
            "address": address,
            "plus_code": pluscode_value
        }
        data = {"coordinates": coordinates}
        response_data = format_response(200, "Plus code conversion successful", summary, data)
        return response_data, 200
    except Exception as e:
        response_data = format_response(500, "Plus code conversion failed", {})
        return response_data, 500

async def process_request(params):
    api_key = "6d92d361185c5fde39372cd3b5582e24"
    if 'geo_type' in params:
        geo_type = params['geo_type']
        lang = params.get('lang', 'en')

        if geo_type == 'geocode' and 'lat' in params and 'lon' in params:
            lat = params['lat']
            lon = params['lon']
            return geocode(lat, lon, lang, api_key)

        elif geo_type == 'reverse' and 'address' in params:
            address = params['address']
            return reverse_geocode(address, lang, api_key)

        elif geo_type == 'pluscode' and 'pluscode_value' in params:
            pluscode_value = params['pluscode_value']
            return convert_pluscode(pluscode_value, api_key)

        else:
            response = format_response(400, "Invalid geocode request parameters", {})
            return response, 400

    else:
        response = format_response(400, "Missing geo_type parameter", {})
        return response, 400

async def get_response(params):
    return await process_request(params)

async def post_response(data):
    return await process_request(data)
