from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pickle
import uvicorn

# ----------------------------
# Load tokenizer and model
# ----------------------------
with open("emotion_model_tokenizer.pkl", "rb") as handle:
    tokenizer = pickle.load(handle)

model = load_model("emotion_classification_model.keras")

# Emotion label mapping to emoji
label_mapping = {
    0: '😞',  # Sadness
    1: '😊',  # Joy
    2: '❤️',  # Love
    3: '😡',  # Anger
    4: '😱',  # Fear
    5: '😲'   # Surprise
}

# Max sequence length (same used during training)
MAX_LEN = 79

# ----------------------------
# Define FastAPI app and schema
# ----------------------------
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:8081",  # React Native development server
    "https://2023-2402-4000-13cd-2f7e-876-a9c1-210b-63e5.ngrok-free.app"  # Ngrok URL (replace with your actual ngrok URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow all listed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


class MessageInput(BaseModel):
    text: str

class PredictionOutput(BaseModel):
    emotion: str

# ----------------------------
# Prediction route
# ----------------------------
@app.post("/predict")
async def predict_emotion(input_data: MessageInput):
    try:
        # Tokenize and pad input text
        sequence = tokenizer.texts_to_sequences([input_data.text])
        padded = pad_sequences(sequence, maxlen=MAX_LEN, padding='post')

        # Predict
        pred = model.predict(padded)
        predicted_label = np.argmax(pred)
        predicted_emotion = label_mapping[predicted_label]

        return predicted_emotion
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in prediction: {str(e)}")

# ----------------------------
# Run the app
# ----------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
