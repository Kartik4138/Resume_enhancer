def evaluate_formatting(formatting: dict) -> list[dict]:
    violations = []

    if not formatting.get("uses_bullets", False):
        violations.append({
            "rule_key": "no_bullets",
            "severity": "HIGH",
            "data": {}
        })

    if formatting.get("long_paragraph_count", 0) >= 2:
        violations.append({
            "rule_key": "long_paragraphs",
            "severity": "MEDIUM",
            "data": {
                "count": formatting["long_paragraph_count"]
            }
        })

    if formatting.get("bullet_count", 0) < 5:
        violations.append({
            "rule_key": "low_bullet_density",
            "severity": "LOW",
            "data": {
                "bullet_count": formatting["bullet_count"]
            }
        })

    return violations


def evaluate_sections(missing_sections: list[str]) -> list[dict]:
    violations = []

    for sec in missing_sections:
        violations.append({
            "rule_key": f"missing_{sec}_section",
            "severity": "HIGH",
            "data": {}
        })

    return violations
