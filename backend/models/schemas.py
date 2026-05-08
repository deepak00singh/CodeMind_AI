from pydantic import BaseModel, Field
from typing import Optional, Literal


class AnalyzeRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=20000)
    language: Literal["python", "javascript", "auto"] = "auto"


class Bug(BaseModel):
    line_number: int
    severity: Literal["critical", "warning", "info"]
    title: str
    description: str
    fix: str


class Optimization(BaseModel):
    line_number: Optional[int] = None
    title: str
    description: str
    example: Optional[str] = None


class Explanation(BaseModel):
    what_it_does: str
    how_it_works: str
    notable_patterns: str


class AnalyzeResponse(BaseModel):
    language: str
    summary: str
    overall_quality: Literal["good", "fair", "poor"]
    bugs: list[Bug]
    optimizations: list[Optimization]
    explanation: Explanation
