from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

print("=" * 60)
print("STARTING BACKEND ON ELASTIC BEANSTALK")
print("=" * 60)

# Check for API key
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print(f"OpenAI API Key found!")
else:
    print("ERROR: OpenAI API Key NOT found!")

# Create FastAPI app (MUST be named 'application')
application = FastAPI()

# Add CORS middleware
application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS middleware added")

# Mount static files RIGHT HERE - BEFORE routes
application.mount("/static", StaticFiles(directory="static"), name="static")
print("Static files mounted")

# Create OpenAI client
try:
    client = OpenAI(api_key=api_key)
    print("OpenAI client created")
except Exception as e:
    print(f"Failed to create OpenAI client: {e}")
    client = None

class SongRequest(BaseModel):
    song_name: str
    artist: str = ""
    album: str = ""
    spotify_id: str = ""
    desired_tone: str = ""

# Serve the main HTML page at root
@application.get("/")
def home():
    html_path = os.path.join("static", "amp-editor.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return {"message": "Tone AI backend running!", "status": "ok"}

@application.get("/health")
def health():
    return {"status": "healthy"}

@application.post("/get_amp_settings")
async def get_amp_settings(request: SongRequest):
    print("\n" + "=" * 60)
    print("🎵 NEW REQUEST")
    print("=" * 60)
    print(f"Song: '{request.song_name}'")
    print(f"Artist: '{request.artist}'")
    print(f"Tone: '{request.desired_tone}'")
    
    if client is None:
        print("ERROR: OpenAI client not initialized")
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Check environment variables."
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

        print("Calling OpenAI API...")
        
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

        print("OpenAI responded!")
        
        settings_text = response.choices[0].message.content.strip()
        print(f"Raw response:\n{settings_text}")
        
        # Clean up markdown if present
        if "```json" in settings_text:
            settings_text = settings_text.split("```json")[1].split("```")[0].strip()
        elif "```" in settings_text:
            settings_text = settings_text.split("```")[1].split("```")[0].strip()
        
        print(f"Cleaned response:\n{settings_text}")
        
        settings = json.loads(settings_text)
        print(f"Parsed settings: {settings}")
        
        # Validate all required keys exist
        required_keys = ["gain", "volume", "bass", "treble", "presence", "master"]
        for key in required_keys:
            if key not in settings:
                print(f"Missing key: {key}, adding default value 50")
                settings[key] = 50
        
        print("=" * 60)
        print("SUCCESS - Returning settings")
        print("=" * 60 + "\n")
        
        return {"settings": settings}
        
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse OpenAI response as JSON: {str(e)}"
        )
    
    except Exception as e:
        print(f"ERROR: {type(e).__name__}")
        print(f"Message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("=" * 60)
print("BACKEND READY")
print("=" * 60)