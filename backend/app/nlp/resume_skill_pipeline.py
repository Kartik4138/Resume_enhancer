from app.nlp.candidate_extractor import extract_candidates
from app.nlp.normalizer import is_valid_candidate, normalize
from app.nlp.skill_scorer import score_skill


def extract_resume_skills_nlp(
    cleaned_text: str,
    sections_detected: dict
) -> list[dict]:
    
    raw_candidates = extract_candidates(cleaned_text)
    skills = []

    for cand in raw_candidates:
        normalized = normalize(cand)
        
        if not is_valid_candidate(normalized):
            continue

        scored = score_skill(
            normalized,
            cleaned_text,
            sections_detected
        )

        if scored["confidence"] >=0.5:
            skills.append(scored)

    return skills