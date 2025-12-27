import os
from google import genai
from google.genai import types

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in environment")


client = genai.Client(api_key=API_KEY)

MODEL_NAME = "gemini-2.5-flash"


def gemini_generate(prompt: str) -> str:
    """
    Single safe Gemini call.
    - Low temperature
    - Deterministic output
    - Always returns text or raises
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json"
        ),
    )

    if not response or not response.text:
        raise RuntimeError("Empty response from Gemini")

    return response.text.strip()
