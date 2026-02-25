import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response

TOOL_NAME = os.getenv("TOOL_NAME", "pricing-detective")

# HTTP Metrics
http_requests = Counter(
    "http_requests_total",
    "HTTP requests",
    ["tool", "endpoint", "method", "status"]
)

http_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint"]
)

# Business Metrics
analyses_total = Counter(
    "pricing_analyses_total",
    "Total pricing analyses performed",
    ["tool"]
)

issues_detected = Counter(
    "pricing_issues_detected_total",
    "Total pricing issues detected",
    ["tool", "issue_type"]
)

free_trial_used = Counter(
    "free_trial_used_total",
    "Free trial usage count",
    ["tool"]
)

tokens_consumed = Counter(
    "tokens_consumed_total",
    "Tokens consumed",
    ["tool"]
)

# Payment Metrics
payment_success = Counter(
    "payment_success_total",
    "Successful payments",
    ["tool", "product_sku"]
)

payment_revenue = Counter(
    "payment_revenue_cents_total",
    "Total revenue in cents",
    ["tool"]
)

# SEO Metrics
page_views = Counter(
    "page_views_total",
    "Page views",
    ["tool", "page"]
)

crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)

metrics_router = APIRouter()


@metrics_router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
