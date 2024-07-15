# routes/version/index.py

import os
import json
import time

cache = {
    "content": None,
    "last_modified": 0
}

def get_version_file_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "version.json")

def read_file_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def create_success_response(version_content):
    return {
        "StatusCode": 200,
        "message": "Success to get Version info",
        "data": version_content
    }, 200

def create_error_response(status_code, message):
    return {
        "StatusCode": status_code,
        "message": message
    }, status_code

def get_file_last_modified_time(file_path):
    return os.path.getmtime(file_path)

async def read_version_file():
    try:
        file_path = get_version_file_path()
        
        if not os.path.exists(file_path):
            return create_error_response(404, "version.json file does not exist.")
        
        last_modified_time = get_file_last_modified_time(file_path)
        
        if cache["content"] and cache["last_modified"] == last_modified_time:
            return create_success_response(cache["content"])
        
        version_content = read_file_content(file_path)
        
        if not version_content:
            return create_error_response(400, "version.json file is empty.")
        
        cache["content"] = version_content
        cache["last_modified"] = last_modified_time
        
        return create_success_response(version_content)
    
    except Exception as e:
        # return create_error_response(500, str(e))
        return create_error_response(500, "Server Error")

async def get_response(params):
    return await read_version_file()

async def post_response(data):
    return await read_version_file()
