# routes/ai/detect_malcomment_v1/index.py

import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np
import re
import emoji
from soynlp.normalizer import repeat_normalize
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

# 모델과 토크나이저 로드 함수
def load_model_and_tokenizer(model_name):
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        return tokenizer, model
    except Exception as e:
        raise ValueError(f"Invalid model file(s): {model_name}")

# KcELECTRA 모델과 토크나이저 로드
model_name = "beomi/KcELECTRA-base-v2022"

try:
    tokenizer, model = load_model_and_tokenizer(model_name)
except ValueError as e:
    raise ValueError(f"Invalid model file(s): {model_name}")

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)
model.eval()

# 데이터 전처리 함수
def clean(text):
    pattern = re.compile(f'[^ .,?!/@$%~％·∼()\x00-\x7Fㄱ-ㅣ가-힣]+')
    url_pattern = re.compile(r'(http|https):\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)')
    text = pattern.sub(' ', str(text))
    text = emoji.replace_emoji(text, replace='')
    text = url_pattern.sub('', text)
    text = text.strip()
    text = repeat_normalize(text, num_repeats=2)
    return text

# 텍스트 임베딩 함수
def get_embeddings(texts):
    inputs = tokenizer(texts, return_tensors='pt', padding=True, truncation=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

# 코사인 유사도로 학습 데이터와 검증 데이터 비교
def predict(train_embeddings, train_labels, val_embeddings):
    similarities = cosine_similarity(val_embeddings, train_embeddings)
    predictions = []
    for sim in similarities:
        pred_label = train_labels[np.argmax(sim)]
        predictions.append(pred_label)
    return np.array(predictions)

# 임베딩과 레이블을 pkl 파일에서 로드
def load_embeddings(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Embedding file not found: {file_path}")
    with open(file_path, 'rb') as f:
        return pickle.load(f)

# 현재 파일 경로
current_dir = os.path.dirname(os.path.abspath(__file__))

train_embeddings, train_labels = load_embeddings(os.path.join(current_dir, 'train_embeddings.pkl'))
val_embeddings, val_labels = load_embeddings(os.path.join(current_dir, 'val_embeddings.pkl'))

# 예측 함수
def predict_input(text):
    cleaned_text = clean(text)
    text_embedding = get_embeddings([cleaned_text])
    predictions = predict(train_embeddings, np.array(train_labels), text_embedding)
    return predictions[0]

# 텍스트 예측 처리 함수
def handle_text_prediction(text):
    if not text:
        return {"StatusCode": 4001, "message": "Cannot found required parameter(s): text"}, 400
    
    try:
        prediction = predict_input(text)
        is_malcomment = "True" if prediction != 0 else "False"
        return {"StatusCode": 200, "message": "Success to detect is malcomment", "data": {"is_malcomment": is_malcomment}}, 200
    except Exception as e:
        return {"StatusCode": 5007, "message": "Cannot detect malcomment"}, 500

# GET 요청 처리 함수
async def get_response(params):
    text = params.get('text', '')
    return handle_text_prediction(text)

# POST 요청 처리 함수
async def post_response(data):
    text = data.get('text', '')
    return handle_text_prediction(text)
