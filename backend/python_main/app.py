from flask import Flask, request, Response
from flask_cors import CORS
import os
import json
import xmltodict
from dotenv import load_dotenv
import importlib
import inspect
import asyncio
import sys
import platform
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
from datetime import datetime
from asgiref.wsgi import WsgiToAsgi
from ast import literal_eval

# 환경변수 파일(.env) 로드
load_dotenv()

app = Flask(__name__)

def get_origins():
    origins = os.getenv('ALLOWED_ORIGINS', '["*"]')
    try:
        origins_list = literal_eval(origins)
        if isinstance(origins_list, list):
            return origins_list
        return ['*']
    except Exception as e:
        print(f"Error parsing ALLOWED_ORIGINS: {e}")
        return ['*']

# 허용된 도메인 목록
allowed_origins = get_origins()

# CORS 설정: 환경변수에서 가져온 ALLOWED_ORIGINS 값을 사용
CORS(app, origins=allowed_origins)

def response_format(data, status=200, content_type='application/json'):
    if content_type == 'application/xml':
        response = Response(xmltodict.unparse({'response': data}, pretty=True), status=status, mimetype=content_type)
    else:
        response = Response(json.dumps(data), status=status, mimetype=content_type)
    return response

def get_content_type():
    response_format_type = request.args.get('format', 'json').lower()
    return 'application/xml' if response_format_type == 'xml' else 'application/json'

@app.before_request
def check_origin():
    origin = request.headers.get('Origin')
    if origin:
        for allowed_origin in allowed_origins:
            if allowed_origin == '*' or allowed_origin in origin or (allowed_origin.startswith('*') and origin.endswith(allowed_origin[1:])):
                return  # 허용된 도메인이므로 계속 진행
    data = {
        "StatusCode": 4030,
        "message": "Do not accept and process requests from unauthorized domains.",
        "RequestTime": datetime.now().isoformat()
    }
    return response_format(data, status=403, content_type=get_content_type())

def find_response_function(module, method):
    for name, func in inspect.getmembers(module, inspect.isfunction):
        if name == f"{method.lower()}_response":
            return func
    return None

async def handle_request(endpoint_path, method):
    content_type = get_content_type()
    module_path = f"routes{endpoint_path.replace('/', '.')}.index"
    
    try:
        module = importlib.import_module(module_path)
    except ImportError:
        return response_format({"error": "Endpoint not found"}, 404, content_type)

    response_function = find_response_function(module, method)
    
    if response_function is None:
        return response_format({"error": f"Method {method} not supported for this endpoint"}, 405, content_type)

    if method == 'GET':
        request_params = request.args.to_dict()
        data, status_code = await response_function(request_params)
    else:  # POST
        try:
            request_data = request.get_json()
        except Exception:
            request_data = None
        data, status_code = await response_function(request_data)

    # Add request time to the response data
    data['RequestTime'] = datetime.now().isoformat()

    return response_format(data, status_code, content_type)

# 공통 라우트 핸들러를 사용하여 엔드포인트 정의
# 서버 연결 확인용 ping 라우트
@app.route('/ping', methods=['GET', 'POST'])
async def ping():
    return await handle_request('/ping', request.method)

# 버전 확인
@app.route('/version', methods=['GET', 'POST'])
async def version():
    return await handle_request('/version', request.method)

# 재난문자 검색
@app.route('/disaster_msg', methods=['GET', 'POST'])
async def disaster_msg():
    return await handle_request('/disaster_msg', request.method)

# 지오코딩/리버스 지오코딩/플러스 코드
@app.route('/map/geocode', methods=['GET', 'POST'])
async def map_geocode():
    return await handle_request('/map/geocode', request.method)

# 대피소 찾기
@app.route('/shelters', methods=['GET', 'POST'])
async def shelters():
    return await handle_request('/shelters', request.method)

#########################
#                       #
#         번역          #
#                       #
#########################

# DeepL 번역
@app.route('/trans/deepl', methods=['GET', 'POST'])
async def trans_deepl():
    return await handle_request('/trans/deepl', request.method)

# 구글 번역
@app.route('/trans/gtran', methods=['GET', 'POST'])
async def trans_gtran():
    return await handle_request('/trans/gtran', request.method)

#########################
#                       #
#       AI 기능         #
#                       #
#########################

# 재난문자 분류 AI
@app.route('/ai/disaster_msg_category_classification', methods=['GET', 'POST'])
async def ai_disaster_msg_category_classification():
    return await handle_request('/ai/disaster_msg_category_classification', request.method)

# 부적절한 말 감지 v1
@app.route('/ai/detect_malcomment_v1', methods=['GET', 'POST'])
async def ai_detect_malcomment_v1():
    return await handle_request('/ai/detect_malcomment_v1', request.method)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    
    if platform.system() == 'Windows':
        import uvicorn
        asgi_app = WsgiToAsgi(app)
        uvicorn.run(asgi_app, host="0.0.0.0", port=port)
    else:
        # Unix 계열 (Linux, macOS)에서는 gunicorn 사용
        class RestartOnChangeHandler(FileSystemEventHandler):
            def __init__(self, process):
                self.process = process

            def on_any_event(self, event):
                self.process.terminate()
                self.process = Popen(['gunicorn', '--bind', f'0.0.0.0:{port}', 'app:app'])

        from subprocess import Popen
        process = Popen(['gunicorn', '--bind', f'0.0.0.0:{port}', 'app:app'])
        
        event_handler = RestartOnChangeHandler(process)
        observer = Observer()
        observer.schedule(event_handler, path='.', recursive=True)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()
        process.terminate()
