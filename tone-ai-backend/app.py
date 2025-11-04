# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Tone AI backend running!"}



load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class SongRequest(BaseModel):
    song_name: str
    artist: str
    desired_tone: str

@app.post("/get_amp_settings")
async def get_amp_settings(request: SongRequest):
    prompt = f"""
    Given the song '{request.song_name}' by {request.artist},
    recommend guitar amp tone settings (gain, bass, mid, treble, reverb, presence)
    that best match the desired tone described as '{request.desired_tone}'.
    """

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return {"settings": response.output_text}