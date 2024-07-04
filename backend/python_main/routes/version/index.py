# routes/version/index.py

import os

def get_version_file_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "version.txt")

def read_file_content(file_path):
    with open(file_path, 'r') as file:
        return file.read().strip()

def create_success_response(version_content):
    return {
        "StatusCode": 200,
        "message": "Success to get Version info",
        "data": {
            "version": version_content
        }
    }, 200

def create_error_response(status_code, message):
    return {
        "StatusCode": status_code,
        "message": message
    }, status_code

async def read_version_file():
    try:
        file_path = get_version_file_path()
        
        if not os.path.exists(file_path):
            return create_error_response(404, "version.txt file does not exist.")
        
        version_content = read_file_content(file_path)
        
        if not version_content:
            return create_error_response(400, "version.txt file is empty.")
        
        return create_success_response(version_content)
    
    except Exception as e:
        return create_error_response(500, str(e))

async def get_response(params):
    return await read_version_file()

async def post_response(data):
    return await read_version_file()
