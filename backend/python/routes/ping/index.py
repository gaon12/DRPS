# routes/ping/index.py

response_data = {
    "StatusCode": 200,
    "message": "pong"
}

async def get_response(params):
    return response_data, 200

async def post_response(data):
    return response_data, 200