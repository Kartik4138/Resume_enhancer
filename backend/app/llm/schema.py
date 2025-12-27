from typing import List, TypedDict


class SkillMatchResult(TypedDict):
    match_percent: float
    matched_skills: List[str]
    missing_skills: List[str]
    weak_skills: List[str]


class KeywordMatchResult(TypedDict):
    score: float
    matched_keywords: List[str]
    missing_keywords: List[str]


class SectionDetectionResult(TypedDict):
    experience: bool
    projects: bool
    skills: bool
    education: bool
    certifications: bool


class SuggestionResult(TypedDict):
    suggestions: List[str]
