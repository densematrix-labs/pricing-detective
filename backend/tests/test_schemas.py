import pytest
from app.schemas import (
    AnalyzeRequest, AnalyzeResponse, PricingIssue, TierAnalysis,
    SeverityLevel, IssueType, HealthResponse
)


class TestSchemas:
    def test_analyze_request_valid(self):
        """Test valid analyze request"""
        req = AnalyzeRequest(
            content="A" * 50,
            tool_name="Test",
            language="en"
        )
        assert req.content == "A" * 50
        assert req.tool_name == "Test"
        assert req.language == "en"
    
    def test_analyze_request_content_min_length(self):
        """Test content minimum length validation"""
        with pytest.raises(Exception):
            AnalyzeRequest(content="short", language="en")
    
    def test_analyze_request_defaults(self):
        """Test default values"""
        req = AnalyzeRequest(content="A" * 50)
        assert req.tool_name is None
        assert req.language == "en"
    
    def test_pricing_issue_model(self):
        """Test pricing issue model"""
        issue = PricingIssue(
            type=IssueType.HIDDEN_FEE,
            severity=SeverityLevel.HIGH,
            title="Hidden Setup Fee",
            description="A $99 setup fee is not clearly disclosed",
            evidence="Setup fee: $99",
            recommendation="Ask about all fees upfront"
        )
        assert issue.type == IssueType.HIDDEN_FEE
        assert issue.severity == SeverityLevel.HIGH
    
    def test_tier_analysis_model(self):
        """Test tier analysis model"""
        tier = TierAnalysis(
            name="Pro",
            stated_price="$19/month",
            true_cost_estimate="$25/month with overages",
            limitations=["1000 requests"],
            hidden_requirements=["Annual billing"]
        )
        assert tier.name == "Pro"
        assert len(tier.limitations) == 1
    
    def test_analyze_response_model(self):
        """Test full analyze response"""
        response = AnalyzeResponse(
            tool_name="TestTool",
            overall_score=75,
            verdict="Mostly honest",
            issues=[],
            tiers=[],
            summary="No major issues found",
            recommendations=["Compare with competitors"]
        )
        assert response.overall_score == 75
        assert 0 <= response.overall_score <= 100
    
    def test_health_response(self):
        """Test health response defaults"""
        health = HealthResponse()
        assert health.status == "ok"
        assert health.service == "pricing-detective"


class TestEnums:
    def test_severity_levels(self):
        """Test all severity levels exist"""
        assert SeverityLevel.LOW.value == "low"
        assert SeverityLevel.MEDIUM.value == "medium"
        assert SeverityLevel.HIGH.value == "high"
        assert SeverityLevel.CRITICAL.value == "critical"
    
    def test_issue_types(self):
        """Test all issue types exist"""
        assert IssueType.HIDDEN_FEE.value == "hidden_fee"
        assert IssueType.FAKE_FREE.value == "fake_free"
        assert IssueType.MISLEADING_PRICE.value == "misleading_price"
        assert IssueType.USAGE_CAP.value == "usage_cap"
        assert IssueType.FEATURE_GATE.value == "feature_gate"
        assert IssueType.TIME_LIMIT.value == "time_limit"
        assert IssueType.REQUIRED_ADDON.value == "required_addon"
        assert IssueType.BAIT_SWITCH.value == "bait_switch"
