from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.preprocessor import preprocess_code, CodeTooLongError, EmptyCodeError
from services.llm_client import analyze_code

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        numbered_code, language = preprocess_code(request.code, request.language)
    except EmptyCodeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except CodeTooLongError as e:
        raise HTTPException(status_code=413, detail=str(e))

    try:
        result = await analyze_code(numbered_code, language)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI response parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return result
