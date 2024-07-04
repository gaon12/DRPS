# routes/trans/gtran/index.py

import os
import subprocess
import json
import sys
import platform
from fastapi import HTTPException

response_data = {
    "StatusCode": 200,
    "message": "Success to translated"
}

def get_os_name_and_architecture():
    platforms = {
        'Linux': 'linux',
        'Darwin': 'macos',
        'Windows': 'win'
    }
    
    architectures = {
        'x86_64': 'x64',
        'AMD64': 'x64',  # Windows uses AMD64 for x64 architecture
        'arm64': 'arm64'
    }
    
    os_name = platform.system()
    architecture = platform.machine()
    
    if os_name not in platforms:
        raise HTTPException(status_code=500, detail="Unsupported platform")
    
    if architecture not in architectures:
        raise HTTPException(status_code=500, detail="Unsupported architecture")
    
    return platforms[os_name], architectures[architecture]

async def translate_text(data):
    os_name, architecture = get_os_name_and_architecture()
    executable = f"gtran-{os_name}-{architecture}"
    if os_name == 'win':
        executable += ".exe"
    else:
        executable = f"./{executable}"
    
    # 현재 파이썬 파일의 절대 경로를 가져와서 실행 파일 경로로 사용
    current_dir = os.path.dirname(os.path.abspath(__file__))
    executable_path = os.path.join(current_dir, executable)
    
    if not os.path.exists(executable_path):
        raise HTTPException(status_code=500, detail="Executable not found")
    
    command = [
        executable_path,
        "--text", data["text"],
        "--target", data["target_lang"]
    ]
    
    if "source_lang" in data:
        command.extend(["--source", data["source_lang"]])
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8')
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Translation command failed")
        
        if "err" in result.stderr:
            raise HTTPException(status_code=500, detail="Translation API error")
        
        return result.stdout.strip()
    
    except subprocess.CalledProcessError as e:
        # 예외 발생 시 상세 정보 출력
        raise HTTPException(status_code=500, detail=f"CalledProcessError: {e}. STDOUT: {e.stdout}. STDERR: {e.stderr}")
    except Exception as e:
        # 기타 예외 발생 시 상세 정보 출력
        raise HTTPException(status_code=500, detail=f"Exception: {e}")

async def handle_translation_request(data):
    required_params = ["text", "target_lang"]
    missing_params = [param for param in required_params if param not in data]
    
    if missing_params:
        response = response_data.copy()
        response["StatusCode"] = 4001
        response["message"] = f"Missing parameter(s): {', '.join(missing_params)}"
        return response, 400
    
    try:
        translation_result_str = await translate_text(data)
        translation_result = json.loads(translation_result_str)
        
    except json.JSONDecodeError as e:
        response = response_data.copy()
        response["StatusCode"] = 5001
        response["message"] = "JSON decode error"
        return response, 500
    except Exception as e:
        response = response_data.copy()
        response["StatusCode"] = 5002
        response["message"] = "Unexpected error occurred"
        return response, 500
    
    response = response_data.copy()
    response["data"] = {"result": translation_result.get("translation")}
    
    if "did_you_mean" in translation_result:
        did_you_mean_text = translation_result.get("did_you_mean").strip('<em></em>')
        did_you_mean_data = {
            "text": did_you_mean_text,
            "source_lang": data["source_lang"],
            "target_lang": data["target_lang"]
        }
        try:
            did_you_mean_translation_str = await translate_text(did_you_mean_data)
            did_you_mean_translation = json.loads(did_you_mean_translation_str)["translation"]
            response["data"]["did_you_mean_original"] = did_you_mean_text
            response["data"]["did_you_mean_translated"] = did_you_mean_translation
        except Exception as e:
            response["data"]["did_you_mean_original"] = did_you_mean_text
            response["data"]["did_you_mean_translated"] = None

    return response, 200

async def get_response(params):
    return await handle_translation_request(params)

async def post_response(data):
    return await handle_translation_request(data)
