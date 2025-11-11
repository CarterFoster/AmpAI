# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

# Load environment variables FIRST
load_dotenv()

print("=" * 60)
print("🚀 STARTING BACKEND")
print("=" * 60)

# Check for API key
api_key = os.getenv("OPENAI_API_KEY")
print(f"📁 Current directory: {os.getcwd()}")
print(f"🔍 Looking for .env file...")

if api_key:
    print(f"✅ OpenAI API Key found!")
    print(f"   Key starts with: {api_key[:15]}...")
else:
    print("❌ ERROR: OpenAI API Key NOT found!")
    print("   Make sure .env file exists with:")
    print("   OPENAI_API_KEY=sk-proj-your-key")
    print("=" * 60)

# Create FastAPI app
app = FastAPI()

# Add CORS middleware - MUST be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

print("✅ CORS middleware added")

# Create OpenAI client
try:
    client = OpenAI(api_key=api_key)
    print("✅ OpenAI client created")
except Exception as e:
    print(f"❌ Failed to create OpenAI client: {e}")
    client = None

class SongRequest(BaseModel):
    song_name: str
    artist: str = ""
    desired_tone: str = ""

@app.get("/")
def home():
    print("📍 Home endpoint accessed")
    return {"message": "Tone AI backend running!", "status": "ok"}

@app.post("/get_amp_settings")
async def get_amp_settings(request: SongRequest):
    print("\n" + "=" * 60)
    print("🎵 NEW REQUEST")
    print("=" * 60)
    print(f"Song: '{request.song_name}'")
    print(f"Artist: '{request.artist}'")
    print(f"Tone: '{request.desired_tone}'")
    
    # Check if OpenAI client exists
    if client is None:
        print("❌ ERROR: OpenAI client not initialized")
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Check .env file."
        )
    
    try:
        prompt = f"""
Given the song '{request.song_name}' by {request.artist}, recommend guitar amp tone settings.

Return ONLY a JSON object with these exact keys (values 0-100):
{{
    "gain": <number>,
    "volume": <number>,
    "bass": <number>,
    "treble": <number>,
    "presence": <number>,
    "master": <number>
}}

Do not include any other text, explanations, or markdown formatting.
"""

        print("🤖 Calling OpenAI API...")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a guitar amp expert. Return ONLY valid JSON with no markdown formatting."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        print("✅ OpenAI responded!")
        
        # Get the response text
        settings_text = response.choices[0].message.content.strip()
        print(f"📝 Raw response:\n{settings_text}")
        
        # Clean up markdown if present
        if "```json" in settings_text:
            settings_text = settings_text.split("```json")[1].split("```")[0].strip()
            print("🧹 Removed ```json markdown")
        elif "```" in settings_text:
            settings_text = settings_text.split("```")[1].split("```")[0].strip()
            print("🧹 Removed ``` markdown")
        
        print(f"🧹 Cleaned response:\n{settings_text}")
        
        # Parse JSON
        settings = json.loads(settings_text)
        print(f"✅ Parsed settings: {settings}")
        
        # Validate all required keys exist
        required_keys = ["gain", "volume", "bass", "treble", "presence", "master"]
        for key in required_keys:
            if key not in settings:
                print(f"⚠️ Missing key: {key}, adding default value 50")
                settings[key] = 50
        
        print("=" * 60)
        print("✅ SUCCESS - Returning settings")
        print("=" * 60 + "\n")
        
        return {"settings": settings}
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"❌ Failed to parse: {settings_text}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse OpenAI response as JSON: {str(e)}"
        )
    
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}")
        print(f"❌ Message: {str(e)}")
        print("=" * 60 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

print("=" * 60)
print("✅ BACKEND READY")
print("🌐 Listening on http://127.0.0.1:8000")
print("=" * 60)