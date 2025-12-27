def score_skill(skill: str, text: str, sections: dict) -> dict:
    confidence = 0.3
    sources = []

    lowered = text.lower()

    occurrences = lowered.count(skill)
    if occurrences >= 2:
        confidence += 0.2

    if "skills" in sections:
        confidence += 0.2
        sources.append("skills")

    if "experience" in sections or "projects" in sections:
        confidence += 0.3
        sources.append("experience")

    confidence = min(confidence, 1.0)

    return {
        "name": skill,
        "confidence": round(confidence, 2),
        "source": list(set(sources))
    }
