import re
from app.nlp.candidate_extractor import extract_candidates
from app.nlp.normalizer import is_valid_candidate, normalize


REQUIRED_KEYWORDS = ("must", "required", "requirement", "mandatory")


def count_occurrences(text: str, skill: str) -> int:
    pattern = rf"\b{re.escape(skill)}\b"
    return len(re.findall(pattern, text))


def is_required_skill(text: str, skill: str) -> bool:
    window = 50
    match = re.search(rf"\b{re.escape(skill)}\b", text)
    if not match:
        return False

    idx = match.start()

    if idx == -1:
        return False

    snippet = text[max(0, idx - window): idx + window]
    return any(k in snippet for k in REQUIRED_KEYWORDS)


def extract_jd_skills(text: str) -> list[dict]:
    raw_candidates = extract_candidates(text)
    lowered = text.lower()

    skill_map = {}

    for cand in raw_candidates:
        normalized = normalize(cand)
        if not is_valid_candidate(normalized):
            continue

        confidence = 0.4

        if count_occurrences(lowered, normalized) >= 2:
            confidence += 0.3

        if is_required_skill(lowered, normalized):
            confidence += 0.2

        confidence = min(confidence, 1.0)

        if confidence < 0.5:
            continue

        # keep highest confidence per skill
        if normalized not in skill_map or confidence > skill_map[normalized]:
            skill_map[normalized] = confidence

    return [
        {"name": name, "confidence": round(conf, 2)}
        for name, conf in skill_map.items()
    ]
