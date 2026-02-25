from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.config import get_settings
from app.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse
from app.analyzer import analyze_pricing
from app.metrics import (
    metrics_router, http_requests, http_duration, 
    free_trial_used, tokens_consumed, TOOL_NAME
)

# Simple in-memory storage for free trial tracking
free_trials: dict[str, int] = {}
FREE_TRIAL_LIMIT = 3


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan"""
    yield


app = FastAPI(
    title="Pricing Detective API",
    description="AI-powered SaaS pricing analyzer - detect hidden fees and fake free tiers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics router
app.include_router(metrics_router)


@app.middleware("http")
async def track_requests(request, call_next):
    """Track request metrics"""
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    endpoint = request.url.path
    http_requests.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=request.method,
        status=response.status_code
    ).inc()
    http_duration.labels(tool=TOOL_NAME, endpoint=endpoint).observe(duration)
    
    return response


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse()


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze(
    request: AnalyzeRequest,
    x_device_id: str = Header(default="anonymous")
):
    """
    Analyze pricing page content for hidden fees and misleading pricing.
    
    Paste the HTML or text content of a SaaS pricing page, and get a 
    detailed analysis of any issues found.
    """
    # Check free trial
    uses = free_trials.get(x_device_id, 0)
    
    if uses >= FREE_TRIAL_LIMIT:
        # Would check for paid tokens here
        raise HTTPException(
            status_code=402,
            detail="Free trial exhausted. Purchase tokens to continue."
        )
    
    # Increment free trial usage
    free_trials[x_device_id] = uses + 1
    free_trial_used.labels(tool=TOOL_NAME).inc()
    
    try:
        result = await analyze_pricing(
            content=request.content,
            tool_name=request.tool_name,
            language=request.language
        )
        tokens_consumed.labels(tool=TOOL_NAME).inc()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/v1/trial-status")
async def trial_status(x_device_id: str = Header(default="anonymous")):
    """Check remaining free trial uses"""
    uses = free_trials.get(x_device_id, 0)
    return {
        "used": uses,
        "remaining": max(0, FREE_TRIAL_LIMIT - uses),
        "limit": FREE_TRIAL_LIMIT
    }
