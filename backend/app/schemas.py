from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueType(str, Enum):
    HIDDEN_FEE = "hidden_fee"
    FAKE_FREE = "fake_free"
    MISLEADING_PRICE = "misleading_price"
    USAGE_CAP = "usage_cap"
    FEATURE_GATE = "feature_gate"
    TIME_LIMIT = "time_limit"
    REQUIRED_ADDON = "required_addon"
    BAIT_SWITCH = "bait_switch"


class PricingIssue(BaseModel):
    """A detected pricing issue"""
    type: IssueType
    severity: SeverityLevel
    title: str
    description: str
    evidence: str = Field(description="Quote from the pricing page proving this issue")
    recommendation: str


class TierAnalysis(BaseModel):
    """Analysis of a pricing tier"""
    name: str
    stated_price: str
    true_cost_estimate: Optional[str] = None
    limitations: list[str] = []
    hidden_requirements: list[str] = []


class AnalyzeRequest(BaseModel):
    """Request to analyze pricing content"""
    content: str = Field(description="Pricing page content (HTML or text)", min_length=50)
    tool_name: Optional[str] = Field(default=None, description="Name of the SaaS tool")
    language: str = Field(default="en", description="Response language code")


class AnalyzeResponse(BaseModel):
    """Pricing analysis response"""
    tool_name: str
    overall_score: int = Field(ge=0, le=100, description="Honesty score 0-100")
    verdict: str = Field(description="One-line verdict")
    issues: list[PricingIssue]
    tiers: list[TierAnalysis]
    summary: str
    recommendations: list[str]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "ok"
    service: str = "pricing-detective"
