import re

BULLET_MARKERS = ("-", "•", "*", "▪", "●")
NUMBERED_BULLET_REGEX = r"^\d+[\.\)]\s+"


def analyze_formatting(text: str) -> dict:
    lines = [line.rstrip() for line in text.split("\n") if line.strip()]

    bullet_lines = []
    paragraph_lines = []

    for line in lines:
        stripped = line.lstrip()

        if (
            stripped.startswith(BULLET_MARKERS)
            or re.match(NUMBERED_BULLET_REGEX, stripped)
        ):
            bullet_lines.append(line)
        else:
            paragraph_lines.append(line)

    long_paragraphs = [
        line for line in paragraph_lines if len(line) > 120
    ]

    return {
        "total_lines": len(lines),
        "bullet_count": len(bullet_lines),
        "paragraph_count": len(paragraph_lines),
        "long_paragraph_count": len(long_paragraphs),
        "uses_bullets": len(bullet_lines) > 0
    }
