import re

STOPWORDS = {
    "system", "systems", "tool", "tools", "technology", "technologies",
    "software", "application", "applications"
}

def normalize(candidate: str) -> str:
    candidate = candidate.lower().strip()

    #remove punctuation
    candidate = re.sub(r"[^\w\s]","",candidate)

    #collapse spaces
    candidate = re.sub(r"\s+", " ", candidate)

    return candidate

def is_valid_candidate(candidate: str) -> bool:
    words = [w.lower() for w in candidate.split()]

    if len(words) == 1 and words[0].endswith("able"):
        return False
    
    if all(word in STOPWORDS for word in words):
        return False
    
    if len(candidate) <= 2:
        return False
    
    return True