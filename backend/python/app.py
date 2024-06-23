from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter
import importlib.util
import os
from datetime import datetime
import json
import yaml
import toml
import dicttoxml
import uvicorn
from dotenv import load_dotenv
import re

load_dotenv()

app = FastAPI()

# 환경 변수에서 허용 도메인 목록과 포트 번호 로드
allowed_origins = json.loads(os.getenv("ALLOWED_ORIGINS", "[]"))
port = int(os.getenv("PORT", 8000))

def is_origin_allowed(origin: str) -> bool:
    if "*" in allowed_origins:
        return True
    for pattern in allowed_origins:
        if re.match(pattern.replace("*", ".*"), origin):
            return True
    return False

@app.middleware("http")
async def check_origin(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin and not is_origin_allowed(origin):
        response = {
            "StatusCode": 4009,
            "message": "Request from NOT ALLOW Domain!",
            "RequestTime": datetime.utcnow().isoformat()
        }
        return JSONResponse(response, status_code=400)
    response = await call_next(request)
    return response

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    response = {
        "StatusCode": 404,
        "message": f"Not found route {request.url.path}",
        "RequestTime": datetime.utcnow().isoformat()
    }
    return JSONResponse(response, status_code=404)

def load_routes():
    routes_path = os.path.join(os.path.dirname(__file__), 'routes')
    for root, dirs, files in os.walk(routes_path):
        for dir_name in dirs:
            route_path = os.path.join(root, dir_name)
            relative_route_path = os.path.relpath(route_path, routes_path).replace("\\", "/")
            
            # 디렉토리 내부에 파이썬 파일이 있는지 확인
            has_python_file = any(fname.endswith('.py') for fname in os.listdir(route_path))
            if not has_python_file:
                continue
            
            print(f"Loading route: {relative_route_path}")  # 디버깅 메시지
            router = APIRouter()

            for filename in os.listdir(route_path):
                file_path = os.path.join(route_path, filename)
                if file_path.endswith('.py'):
                    spec = importlib.util.spec_from_file_location(filename[:-3], file_path)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    if hasattr(module, 'get_response'):
                        @router.get(f"/{relative_route_path}")
                        async def get_handler(request: Request, format: str = "json"):
                            response, status_code = await module.get_response(request.query_params)
                            return format_response(response, format, request, status_code)
                    
                    if hasattr(module, 'post_response'):
                        @router.post(f"/{relative_route_path}")
                        async def post_handler(request: Request, format: str = "json"):
                            data = await request.json()
                            response, status_code = await module.post_response(data)
                            return format_response(response, format, request, status_code)

            app.include_router(router)
            print(f"Route {relative_route_path} loaded.")  # 디버깅 메시지

def format_response(response: dict, format: str, request: Request, status_code: int):
    response["RequestTime"] = datetime.utcnow().isoformat()
    
    if format == "xml":
        xml_response = dicttoxml.dicttoxml(response, custom_root='response', attr_type=False)
        return Response(content=xml_response, media_type="application/xml", status_code=status_code)
    elif format == "yaml":
        yaml_response = yaml.dump(response)
        return Response(content=yaml_response, media_type="application/x-yaml", status_code=status_code)
    elif format == "toml":
        toml_response = toml.dumps(response)
        return Response(content=toml_response, media_type="application/toml", status_code=status_code)
    else:
        return JSONResponse(response, status_code=status_code)

@app.get("/version")
async def version():
    response = {"version": "1.0.0"}
    return format_response(response, "json", None, 200)

# 라우트를 동적으로 로드
load_routes()

if __name__ == "__main__":
    import sys
    if os.getenv("ENV") == "development":
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
    else:
        if os.name == "nt":  # Windows
            uvicorn.run(app, host="0.0.0.0", port=port)
        else:
            import multiprocessing
            workers = multiprocessing.cpu_count() * 2 + 1
            command = f"gunicorn -w {workers} -k uvicorn.workers.UvicornWorker -b 0.0.0.0:{port} main:app"
            os.system(command)
