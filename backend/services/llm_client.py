import json
import os
import re
import hashlib
from openai import AsyncOpenAI
from prompts.analysis_prompt import SYSTEM_PROMPT, build_user_prompt
from models.schemas import AnalyzeResponse

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Simple in-memory cache — avoids duplicate LLM calls within a session
_cache: dict[str, AnalyzeResponse] = {}


async def analyze_code(numbered_code: str, language: str) -> AnalyzeResponse:
    cache_key = hashlib.md5((numbered_code + language).encode()).hexdigest()
    if cache_key in _cache:
        return _cache[cache_key]

    result = await _call_llm(numbered_code, language)
    _cache[cache_key] = result
    return result


async def _call_llm(numbered_code: str, language: str) -> AnalyzeResponse:
    user_prompt = build_user_prompt(numbered_code, language)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.1,       # Very low — maximise determinism, minimise hallucinations
        max_tokens=2000,
        timeout=30,
    )

    raw = response.choices[0].message.content.strip()
    parsed = _extract_and_validate_json(raw)
    return AnalyzeResponse(**parsed)


def _extract_and_validate_json(raw: str) -> dict:
    """Extract JSON from LLM response even if it has minor formatting issues."""
    # Try direct parse first
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON block from markdown-wrapped response
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding first { ... } block
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse LLM response as JSON. Raw: {raw[:200]}")
