import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def mock_llm_response():
    """Mock LLM response"""
    return {
        "tool_name": "TestTool",
        "overall_score": 75,
        "verdict": "Generally honest with some issues",
        "issues": [
            {
                "type": "hidden_fee",
                "severity": "medium",
                "title": "Setup Fee",
                "description": "There is a one-time setup fee not clearly disclosed",
                "evidence": "Setup fee: $99 (one-time)",
                "recommendation": "Ask about setup fees before signing up"
            }
        ],
        "tiers": [
            {
                "name": "Free",
                "stated_price": "$0/month",
                "true_cost_estimate": "$0 for limited usage",
                "limitations": ["100 requests/month", "No API access"],
                "hidden_requirements": []
            },
            {
                "name": "Pro",
                "stated_price": "$19/month",
                "true_cost_estimate": "$19-50/month with overages",
                "limitations": ["1000 requests/month"],
                "hidden_requirements": ["Annual billing required for discount"]
            }
        ],
        "summary": "The pricing is mostly transparent but has some hidden fees.",
        "recommendations": ["Check for overage charges", "Verify billing cycle"]
    }


@pytest.fixture
def mock_analyze(mock_llm_response):
    """Mock the LLM analyze call"""
    import json
    
    async def mock_post(*args, **kwargs):
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{
                "message": {
                    "content": json.dumps(mock_llm_response)
                }
            }]
        }
        mock_response.raise_for_status = lambda: None
        return mock_response
    
    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = mock_post
        mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_instance.__aexit__ = AsyncMock(return_value=None)
        mock_client.return_value = mock_instance
        yield mock_client
