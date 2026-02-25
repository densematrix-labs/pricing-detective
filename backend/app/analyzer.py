import httpx
import json
import re
from app.config import get_settings
from app.schemas import AnalyzeResponse, PricingIssue, TierAnalysis, IssueType, SeverityLevel
from app.metrics import analyses_total, issues_detected, TOOL_NAME

ANALYSIS_PROMPT = """You are a pricing transparency analyst. Your job is to analyze SaaS pricing pages and detect hidden fees, fake free tiers, and misleading pricing tactics.

Analyze the following pricing page content and identify ALL issues:

## Issue Types to Detect:

1. **hidden_fee** - Undisclosed fees (setup fees, overage charges, required add-ons)
2. **fake_free** - "Free" tiers with severe limitations that make them unusable
3. **misleading_price** - Prices shown in a misleading way (annual price shown as monthly, per-user vs per-seat confusion)
4. **usage_cap** - Hidden usage limits that most users will exceed
5. **feature_gate** - Essential features locked behind expensive tiers
6. **time_limit** - Trials disguised as "free" plans
7. **required_addon** - Core functionality requires paid add-ons
8. **bait_switch** - "Starting at" prices that don't apply to realistic use cases

## Pricing Page Content:
{content}

## Respond in JSON format:
{{
  "tool_name": "Name of the tool (extract from content or use 'Unknown')",
  "overall_score": <0-100, where 100 is completely honest>,
  "verdict": "One sentence verdict",
  "issues": [
    {{
      "type": "<issue_type>",
      "severity": "low|medium|high|critical",
      "title": "Short title",
      "description": "Detailed explanation",
      "evidence": "Exact quote from pricing page",
      "recommendation": "What users should know"
    }}
  ],
  "tiers": [
    {{
      "name": "Tier name",
      "stated_price": "$X/month",
      "true_cost_estimate": "Realistic cost for typical usage",
      "limitations": ["Limitation 1", "Limitation 2"],
      "hidden_requirements": ["Requirement 1"]
    }}
  ],
  "summary": "2-3 sentence summary of findings",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}

Be thorough but fair. Only flag real issues with evidence."""


async def analyze_pricing(content: str, tool_name: str | None, language: str) -> AnalyzeResponse:
    """Analyze pricing content using LLM"""
    settings = get_settings()
    
    # Build prompt
    prompt = ANALYSIS_PROMPT.format(content=content[:15000])  # Limit content size
    
    if language != "en":
        prompt += f"\n\nIMPORTANT: Respond in {language} language."
    
    # Call LLM proxy
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.llm_proxy_url}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.llm_proxy_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 4000
            }
        )
        response.raise_for_status()
        data = response.json()
    
    # Parse response
    content_text = data["choices"][0]["message"]["content"]
    
    # Extract JSON from response (handle markdown code blocks)
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', content_text)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_str = content_text
    
    result = json.loads(json_str)
    
    # Track metrics
    analyses_total.labels(tool=TOOL_NAME).inc()
    for issue in result.get("issues", []):
        issues_detected.labels(tool=TOOL_NAME, issue_type=issue.get("type", "unknown")).inc()
    
    # Build response
    return AnalyzeResponse(
        tool_name=result.get("tool_name", tool_name or "Unknown"),
        overall_score=result.get("overall_score", 50),
        verdict=result.get("verdict", "Analysis complete"),
        issues=[
            PricingIssue(
                type=IssueType(issue["type"]) if issue["type"] in [e.value for e in IssueType] else IssueType.HIDDEN_FEE,
                severity=SeverityLevel(issue.get("severity", "medium")),
                title=issue["title"],
                description=issue["description"],
                evidence=issue.get("evidence", ""),
                recommendation=issue.get("recommendation", "")
            )
            for issue in result.get("issues", [])
        ],
        tiers=[
            TierAnalysis(
                name=tier["name"],
                stated_price=tier.get("stated_price", "Unknown"),
                true_cost_estimate=tier.get("true_cost_estimate"),
                limitations=tier.get("limitations", []),
                hidden_requirements=tier.get("hidden_requirements", [])
            )
            for tier in result.get("tiers", [])
        ],
        summary=result.get("summary", ""),
        recommendations=result.get("recommendations", [])
    )
