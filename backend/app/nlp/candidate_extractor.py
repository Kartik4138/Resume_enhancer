import spacy

nlp = spacy.load("en_core_web_sm")


def extract_candidates(text: str) -> set[str]:
    """
    Broad extraction: noun phrases + named entities
    """
    doc = nlp(text)
    candidates = set()

    # noun phrases (1–3 words)
    for chunk in doc.noun_chunks:
        tokens = chunk.text.lower().strip()
        if 1 <= len(tokens.split()) <= 3:
            candidates.add(tokens)

    # named entities (tech-relevant)
    for ent in doc.ents:
        if ent.label_ in {"PRODUCT", "ORG", "LANGUAGE"}:
            candidates.add(ent.text.lower().strip())

    return candidates
