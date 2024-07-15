import os
import json

cache = {}

def get_version_info_path(version):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    version_dir = os.path.join(base_dir, "version_info", version)
    return os.path.join(version_dir, "info.json")

def read_file_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def create_success_response(data):
    return {
        "StatusCode": 200,
        "message": "Success to get Version info",
        "data": data
    }, 200

def create_error_response(status_code, message):
    return {
        "StatusCode": status_code,
        "message": message
    }, status_code

def get_version_data(version, lang='en'):
    file_path = get_version_info_path(version)
    if not os.path.exists(file_path):
        return None
    
    version_data = read_file_content(file_path)
    return version_data.get(lang, version_data.get('en', {}))

def filter_versions(start_version, end_version, versions):
    # Assuming versions are sorted and labeled properly, filter logic can be more complex based on version format
    sorted_versions = sorted(versions)  # Sort to ensure order
    start_index = sorted_versions.index(start_version)
    end_index = sorted_versions.index(end_version) + 1
    return sorted_versions[start_index:end_index]

async def get_response(params):
    version = params.get('version')
    start_version = params.get('start_version')
    end_version = params.get('end_version')
    lang = params.get('lang', 'en')

    if start_version and not end_version:
        return create_error_response(400, "End version is required when start version is provided.")
    if end_version and not start_version:
        return create_error_response(400, "Start version is required when end version is provided.")

    if start_version and end_version:
        versions = os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "version_info"))
        try:
            relevant_versions = filter_versions(start_version, end_version, versions)
            data = []
            for version in relevant_versions:
                version_info = get_version_data(version, lang)
                if version_info:
                    data.append({"version": version, "data": version_info})
            return create_success_response(data)
        except ValueError as e:
            return create_error_response(400, "Invalid version range.")
    
    if version:
        version_info = get_version_data(version, lang)
        if version_info:
            return create_success_response([{"version": version, "data": version_info}])
        else:
            return create_error_response(404, "Version not found.")
    
    return create_error_response(400, "Invalid request parameters.")

async def post_response(data):
    return await get_response(data)
