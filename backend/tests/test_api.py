import pytest
from fastapi.testclient import TestClient


class TestHealth:
    def test_health_check(self, client):
        """Test health endpoint returns 200"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "pricing-detective"


class TestTrialStatus:
    def test_trial_status_new_device(self, client):
        """Test trial status for new device"""
        response = client.get(
            "/api/v1/trial-status",
            headers={"X-Device-Id": "new-device-123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["used"] == 0
        assert data["remaining"] == 3
        assert data["limit"] == 3


class TestAnalyze:
    def test_analyze_success(self, client, mock_analyze, mock_llm_response):
        """Test successful analysis"""
        response = client.post(
            "/api/v1/analyze",
            headers={"X-Device-Id": "test-device-1"},
            json={
                "content": "Free plan: $0/month. Pro plan: $19/month. Setup fee: $99. " * 5,
                "tool_name": "TestTool",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["tool_name"] == "TestTool"
        assert data["overall_score"] == 75
        assert len(data["issues"]) == 1
        assert data["issues"][0]["type"] == "hidden_fee"
    
    def test_analyze_content_too_short(self, client):
        """Test validation for short content"""
        response = client.post(
            "/api/v1/analyze",
            headers={"X-Device-Id": "test-device-2"},
            json={
                "content": "Too short",
                "language": "en"
            }
        )
        assert response.status_code == 422
    
    def test_analyze_free_trial_limit(self, client, mock_analyze):
        """Test free trial limit enforcement"""
        device_id = "test-device-limit"
        content = "Test pricing content " * 10
        
        # Use up free trials
        for i in range(3):
            response = client.post(
                "/api/v1/analyze",
                headers={"X-Device-Id": device_id},
                json={"content": content, "language": "en"}
            )
            assert response.status_code == 200
        
        # 4th request should fail
        response = client.post(
            "/api/v1/analyze",
            headers={"X-Device-Id": device_id},
            json={"content": content, "language": "en"}
        )
        assert response.status_code == 402
    
    def test_402_error_detail_is_string(self, client, mock_analyze):
        """Test that 402 error detail is a string, not object"""
        device_id = "test-device-402"
        content = "Test pricing content " * 10
        
        # Use up free trials
        for _ in range(3):
            client.post(
                "/api/v1/analyze",
                headers={"X-Device-Id": device_id},
                json={"content": content, "language": "en"}
            )
        
        # Get 402 response
        response = client.post(
            "/api/v1/analyze",
            headers={"X-Device-Id": device_id},
            json={"content": content, "language": "en"}
        )
        assert response.status_code == 402
        data = response.json()
        
        # Detail should be a string
        assert isinstance(data["detail"], str)
        assert "[object Object]" not in data["detail"]


class TestMetrics:
    def test_metrics_endpoint(self, client):
        """Test Prometheus metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        assert "text/plain" in response.headers["content-type"]
        assert "http_requests_total" in response.text
