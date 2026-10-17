from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    PROJECT_NAME: str = "KrushiScan AI API"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS (Strict whitelist; wildcard '*' is explicitly forbidden when credentials=True)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sanketlinganwar-glitch.github.io",
    ]
    
    # Rate Limiting
    RATE_LIMIT_AI_PER_MINUTE: int = 20
    RATE_LIMIT_DEFAULT_PER_MINUTE: int = 100
    RATE_LIMIT_AUTH_PER_MINUTE: int = 15
    
    # Supabase (PostgreSQL + Auth + Storage)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # AI Vision & LLM
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Mandi Data / Agmarknet (Data.gov.in)
    DATA_GOV_IN_API_KEY: str = ""
    
    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Security
    JWT_ALGORITHM: str = "HS256"
    MAX_IMAGE_UPLOAD_BYTES: int = 10 * 1024 * 1024 # 10 MB

settings = Settings()
