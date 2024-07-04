# routes/ping/index.py

import os
import torch
from transformers import ElectraTokenizer, ElectraForSequenceClassification
import joblib

# 현재 파일의 디렉토리 경로를 가져옴
current_dir = os.path.dirname(os.path.abspath(__file__))

# 모델 및 토크나이저 로드
model_path = os.path.join(current_dir, 'best_model.pt')
model_name = 'monologg/koelectra-base-v3-discriminator'
tokenizer = ElectraTokenizer.from_pretrained(model_name)
model = ElectraForSequenceClassification.from_pretrained(model_name, num_labels=33)  # num_labels는 학습 시 설정과 동일해야 합니다.
model.load_state_dict(torch.load(model_path))
model.eval()

# LabelEncoder 로드
label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
label_encoder = joblib.load(label_encoder_path)

response_data = {
    "StatusCode": 200,
    "message": "Disaster message classification successful!"
}

def predict_category(text):
    # "찾습니다" 또는 "112" 문구가 있으면 "실종"으로 설정
    if '찾습니다' in text and '112' in text:
        return "실종"

    inputs = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=128,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )
    input_ids = inputs['input_ids']
    attention_mask = inputs['attention_mask']

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
    logits = outputs.logits
    predicted_class_id = torch.argmax(logits, dim=1).item()
    predicted_category = label_encoder.inverse_transform([predicted_class_id])[0]

    return predicted_category

async def handle_request(text):
    response = response_data.copy()

    if not text:
        response["StatusCode"] = 400
        response["message"] = "No text provided"
        return response, 400
    
    category = predict_category(text)
    if category is None:
        response["StatusCode"] = 500
        response["message"] = "Error in prediction"
        return response, 500
    
    response["data"] = {"category": category}
    return response, 200

async def get_response(params):
    text = params.get('text', '')
    return await handle_request(text)

async def post_response(data):
    text = data.get('text', '')
    return await handle_request(text)
