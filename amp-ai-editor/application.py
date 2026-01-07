from fastapi import FastAPI, HTTPException, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import boto3
from botocore.exceptions import ClientError
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid
import httpx
from typing import Optional

# Load environment variables
load_dotenv()

print("=" * 60)
print("STARTING BACKEND WITH AUTHENTICATION")
print("=" * 60)

# Configuration
api_key = os.getenv("OPENAI_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Spotify Configuration
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# DynamoDB setup
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('ampai-users')

# FastAPI app
application = FastAPI()

# CORS
application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
application.mount("/static", StaticFiles(directory="static"), name="static")

# OpenAI client
try:
    client = OpenAI(api_key=api_key)
    print("OpenAI client created")
except Exception as e:
    print(f"Failed to create OpenAI client: {e}")
    client = None

# Security
security = HTTPBearer()

# Spotify token cache
spotify_token_cache = {
    "token": None,
    "expires_at": None
}

# Pydantic models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SongRequest(BaseModel):
    song_name: str
    artist: str = ""
    album: str = ""
    spotify_id: str = ""
    desired_tone: str = ""

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload

async def get_spotify_token() -> Optional[str]:
    """Get Spotify access token (with caching)"""
    now = datetime.utcnow()
    
    # Return cached token if still valid
    if spotify_token_cache["token"] and spotify_token_cache["expires_at"] and now < spotify_token_cache["expires_at"]:
        print("🎵 Using cached Spotify token")
        return spotify_token_cache["token"]
    
    # Get new token
    print("🎵 Requesting new Spotify token...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://accounts.spotify.com/api/token",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET),
                data={"grant_type": "client_credentials"}
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data["access_token"]
                expires_in = data["expires_in"]  # seconds
                
                # Cache token
                spotify_token_cache["token"] = token
                spotify_token_cache["expires_at"] = now + timedelta(seconds=expires_in - 60)  # 60s buffer
                
                print(f"✅ Spotify token obtained (expires in {expires_in}s)")
                return token
            else:
                print(f"❌ Spotify auth failed: {response.status_code}")
                return None
                
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

# Routes - Public pages
@application.get("/")
def landing_page():
    """Landing page - public"""
    landing_path = os.path.join("static", "landing", "index.html")
    if os.path.exists(landing_path):
        return FileResponse(landing_path)
    return {"message": "Landing page not found"}

# @application.get("/login")
# def login_page():
#     """Login page - public"""
#     login_path = os.path.join("static", "login", "index.html")
#     if os.path.exists(login_path):
#         return FileResponse(login_path)
#     return {"message": "Login page not found"}

@application.get("/app")
def app_page():
    """Amp editor - requires authentication (checked client-side)"""
    app_path = os.path.join("static", "app", "index.html")
    if os.path.exists(app_path):
        return FileResponse(app_path)
    return {"message": "App not found"}

# Auth endpoints
@application.post("/api/signup")
async def signup(request: SignupRequest):
    """Create new user account"""
    try:
        # Check if user exists
        response = users_table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={':email': request.email}
        )
        
        if response['Items']:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_pw = hash_password(request.password)
        
        users_table.put_item(Item={
            'userId': user_id,
            'email': request.email,
            'password': hashed_pw,
            'name': request.name,
            'created_at': datetime.utcnow().isoformat()
        })
        
        # Create token
        token = create_jwt_token(user_id, request.email)
        
        return {
            "message": "User created successfully",
            "token": token,
            "user": {
                "userId": user_id,
                "email": request.email,
                "name": request.name
            }
        }
        
    except ClientError as e:
        print(f"DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@application.post("/api/login")
async def login(request: LoginRequest):
    """Login user"""
    try:
        # Find user by email
        response = users_table.query(
            IndexName='email-index',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={':email': request.email}
        )
        
        if not response['Items']:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = response['Items'][0]
        
        # Verify password
        if not verify_password(request.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        token = create_jwt_token(user['userId'], user['email'])
        
        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "userId": user['userId'],
                "email": user['email'],
                "name": user.get('name', '')
            }
        }
        
    except ClientError as e:
        print(f"DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@application.get("/api/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    try:
        response = users_table.get_item(Key={'userId': current_user['user_id']})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response['Item']
        return {
            "userId": user['userId'],
            "email": user['email'],
            "name": user.get('name', '')
        }
    except ClientError as e:
        print(f"DynamoDB error: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@application.get("/health")
def health():
    return {"status": "healthy"}

# Spotify search endpoint - PUBLIC (no auth required)
@application.get("/api/spotify/search")
async def spotify_search(q: str):
    """Search Spotify tracks - PUBLIC endpoint"""
    if not q or len(q) < 2:
        raise HTTPException(status_code=400, detail="Query too short")
    
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Spotify credentials not configured")
    
    token = await get_spotify_token()
    if not token:
        raise HTTPException(status_code=500, detail="Failed to authenticate with Spotify")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.spotify.com/v1/search",
                headers={
                    "Authorization": f"Bearer {token}"
                },
                params={
                    "q": q,
                    "type": "track",
                    "limit": 10
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"✅ Spotify search successful for: '{q}'")
                return response.json()
            else:
                print(f"❌ Spotify search failed: {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Spotify search failed")
                
    except httpx.TimeoutException:
        print("❌ Spotify search timeout")
        raise HTTPException(status_code=504, detail="Spotify search timeout")
    except Exception as e:
        print(f"❌ Spotify search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Protected endpoint - Generate amp settings
@application.post("/api/get_amp_settings")
async def get_amp_settings(
    request: SongRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate amp settings - PROTECTED"""
    print("\n" + "=" * 60)
    print("🎵 NEW REQUEST (Authenticated)")
    print("=" * 60)
    print(f"User: {current_user['email']}")
    print(f"Song: '{request.song_name}'")
    print(f"Artist: '{request.artist}'")
    
    if client is None:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured"
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

        settings_text = response.choices[0].message.content.strip()
        
        # Clean up markdown
        if "```json" in settings_text:
            settings_text = settings_text.split("```json")[1].split("```")[0].strip()
        elif "```" in settings_text:
            settings_text = settings_text.split("```")[1].split("```")[0].strip()
        
        settings = json.loads(settings_text)
        
        # Validate keys
        required_keys = ["gain", "volume", "bass", "treble", "presence", "master"]
        for key in required_keys:
            if key not in settings:
                settings[key] = 50
        
        print("SUCCESS - Returning settings")
        print("=" * 60 + "\n")
        
        return {"settings": settings}
        
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse OpenAI response"
        )
    
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("=" * 60)
print("BACKEND READY WITH AUTHENTICATION + SPOTIFY")
print("=" * 60)