def clamp(value: float, min_v: float, max_v: float) -> float:
    return max(min_v, min(value, max_v))


def compute_skill_score(skills_block: dict) -> float:
    """
    skills.match_percent → 0–100
    Contribution: 45 points
    """
    match_percent = skills_block.get("match_percent", 0)
    match_percent = clamp(match_percent, 0, 100)

    return round((match_percent / 100) * 45, 2)


def compute_experience_score(exp_block: dict) -> float:
    """
    experience.relevance_score → 0–100
    Contribution: 30 points
    """
    relevance = exp_block.get("relevance_score", 0)
    relevance = clamp(relevance, 0, 100)

    return round((relevance / 100) * 30, 2)


def compute_keyword_score(keyword_block: dict) -> float:
    """
    Keyword strength based on matched/weak/missing
    Contribution: 15 points
    """
    matched = len(keyword_block.get("matched", []))
    weak = len(keyword_block.get("weak", []))
    missing = len(keyword_block.get("missing", []))

    total = matched + weak + missing
    if total == 0:
        return 0.0

    raw = (matched + (0.5 * weak)) / total
    return round(raw * 15, 2)


def compute_section_score(section_block: dict) -> float:
    """
    Required sections: skills, experience, education
    Contribution: 5 points
    """
    required = ["skills", "experience", "education"]
    present = sum(1 for s in required if section_block.get(s))

    return round((present / len(required)) * 5, 2)


def compute_formatting_score(formatting_block: dict) -> float:
    """
    Formatting score provided by Gemini (0-100)
    Contribution: 5 points
    """
    score = formatting_block.get("score", 0)
    score = clamp(score, 0, 100)

    return round((score / 100) * 5, 2)


def aggregate_ats_score(
    gemini_result: dict,
    formatting: dict 
) -> dict:
    skill_score = compute_skill_score(gemini_result["skills"])
    experience_score = compute_experience_score(gemini_result["experience"])
    keyword_score = compute_keyword_score(gemini_result["keywords"])
    section_score = compute_section_score(gemini_result["sections"])
    
    formatting_score = compute_formatting_score(gemini_result.get("formatting", {}))

    final_score = round(
        skill_score
        + experience_score
        + keyword_score
        + section_score
        + formatting_score,
        2
    )

    return {
        "final_ats_score": final_score,
        "score_breakdown": {
            "skills": skill_score,
            "experience": experience_score,
            "keywords": keyword_score,
            "sections": section_score,
            "formatting": formatting_score,
        }
    }