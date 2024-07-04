# routes/trans/deepl/index.py

import aiohttp
from fastapi import HTTPException
import os
import sys
from dotenv import load_dotenv

# Move up three directories
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, "../../../"))
sys.path.append(parent_dir)

# Load environment variables from .env file
try:
    load_dotenv(os.path.join(parent_dir, ".env"))
    DEEPLX_API_URL = os.getenv("deeplx")
    if not DEEPLX_API_URL:
        raise ValueError("deeplx URL is not set in the environment variables")
except Exception as e:
    raise RuntimeError("Failed to load environment variables") from e

response_data = {
    "StatusCode": 200,
    "message": "Success to translated"
}

async def translate_text(data):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(DEEPLX_API_URL, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    if not result:
                        raise HTTPException(status_code=502, detail="Error: The value was not received from the API server")
                    return result
                else:
                    raise HTTPException(status_code=response.status, detail="Translation API failed")
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=503, detail="Service Unavailable") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error") from e

async def handle_translation_request(data):
    required_params = ["text", "source_lang", "target_lang"]
    missing_params = [param for param in required_params if param not in data]
    
    if missing_params:
        response = response_data.copy()
        response["StatusCode"] = 4001
        response["message"] = f"Missing parameter(s): {', '.join(missing_params)}"
        return response, 400
    
    try:
        translation_result = await translate_text(data)
    except HTTPException as e:
        response = response_data.copy()
        response["StatusCode"] = e.status_code
        response["message"] = e.detail
        return response, e.status_code
    except Exception as e:
        response = response_data.copy()
        response["StatusCode"] = 500
        response["message"] = "An unexpected error occurred"
        return response, 500
    
    response = response_data.copy()
    response["data"] = {"result": translation_result.get("data")}
    
    if "alternatives" in translation_result:
        response["data"]["alternative"] = translation_result.get("alternatives")
    
    return response, 200

async def get_response(params):
    return await handle_translation_request(params)

async def post_response(data):
    return await handle_translation_request(data)
