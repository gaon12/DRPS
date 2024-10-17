import torch
from transformers import ElectraTokenizer, ElectraForSequenceClassification
import joblib
import pymysql
from tqdm import tqdm

# 모델 및 토크나이저 로드
model_path = 'best_model.pt'
model_name = 'monologg/koelectra-base-v3-discriminator'
tokenizer = ElectraTokenizer.from_pretrained(model_name)
model = ElectraForSequenceClassification.from_pretrained(model_name, num_labels=33)  # num_labels는 학습 시 설정과 동일해야 합니다.

# GPU로 학습된 모델을 CPU에서 로드할 때 map_location 사용
model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
model.eval()

# LabelEncoder 로드
label_encoder = joblib.load('label_encoder.joblib')

# 데이터베이스 연결 설정
db_config = {
    'host': 'localhost',
    'user': 'dbadmin',
    'password': 'gaon10133',
    'database': 'DRPS',
    'charset': 'utf8mb4'
}

def predict_category(text):
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

# 데이터베이스 연결
connection = pymysql.connect(**db_config)

try:
    with connection.cursor() as cursor:
        # disaster_type이 '기타' 또는 'na'인 레코드의 message_content 가져오기
        query = "SELECT id, message_content FROM disaster_messages WHERE disaster_type IN ('기타', 'na')"
        cursor.execute(query)
        messages = cursor.fetchall()

    # tqdm으로 프로그레스 바 추가
    for message in tqdm(messages, desc="Processing disaster messages"):
        message_id = message[0]
        message_content = message[1]

        # 모델을 사용하여 category 예측
        predicted_category = predict_category(message_content)

        # 예측된 category로 disaster_type 업데이트
        update_query = """
        UPDATE disaster_messages 
        SET disaster_type = %s, modified_at = NOW() 
        WHERE id = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(update_query, (predicted_category, message_id))
            connection.commit()

    print("Disaster types with '기타' or 'na' updated successfully!")
except Exception as e:
    print(f"Error: {str(e)}")
finally:
    connection.close()
