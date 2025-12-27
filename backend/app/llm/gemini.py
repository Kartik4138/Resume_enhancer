import json
import logging
from app.llm.gemini_client import gemini_generate
from app.llm.prompts import (
    ATS_ANALYSIS_PROMPT
)

logger = logging.getLogger("gemini")
logger.setLevel(logging.INFO)

if not logger.handlers:
    formatter = logging.Formatter(
        "%(asctime)s | GEMINI | %(message)s"
    )

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    file_handler = logging.FileHandler(
        "gemini_debug.log",
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)


def _safe_json_parse(text: str):
    """
    Extracts and parses JSON content from the LLM string response.
    """
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("No JSON object found in LLM response")

        clean = text[start:end + 1]
        return json.loads(clean)

    except Exception as e:
        logger.error(f"JSON Parsing Error. Raw text: {text}")
        raise ValueError(f"Invalid Gemini JSON output format.") from e


def gemini_full_ats_analysis(resume_text: str, jd_text: str) -> dict:
    """
    Performs full ATS analysis using Gemini. 
    """
    logger.info("Calling Gemini ATS analysis...")

    prompt = ATS_ANALYSIS_PROMPT \
        .replace("<<<RESUME_TEXT>>>", resume_text[:5000]) \
        .replace("<<<JD_TEXT>>>", jd_text[:5000])

    text = gemini_generate(prompt)

    logger.info("===== GEMINI RAW OUTPUT START =====")
    logger.info(text)
    logger.info("===== GEMINI RAW OUTPUT END =====")

    data = _safe_json_parse(text)
    return data