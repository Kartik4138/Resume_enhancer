def compute_final_ats_score(
    skill_score: float,
    experience_score: float,
    section_score: float,
    formatting_score: float,
    keyword_score: float
) -> dict:
    total = round(
        skill_score +
        experience_score +
        section_score +
        formatting_score +
        keyword_score,
        2
    )

    total = min(total, 100.0)

    return {
        "final_ats_score": total,
        "breakdown": {
            "skills": round(skill_score, 2),
            "experience": round(experience_score, 2),
            "sections": round(section_score, 2),
            "formatting": round(formatting_score, 2),
            "keywords": round(keyword_score, 2)
        }
    }