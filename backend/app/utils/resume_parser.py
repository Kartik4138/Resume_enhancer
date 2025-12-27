from pathlib import Path
from pypdf import PdfReader
from docx import Document


def extract_text_from_pdf(file_path: Path) -> str:
    try:
        reader = PdfReader(file_path)
        text = []

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)

        return "\n".join(text)
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {e}")


def extract_text_from_docx(file_path: Path) -> str:
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs)


def extract_resume_text(file_path: str) -> str:
    path = Path(file_path)

    if path.suffix.lower() == ".pdf":
        return extract_text_from_pdf(path)

    if path.suffix.lower() == ".docx":
        return extract_text_from_docx(path)

    raise ValueError("Unsupported file type")


def clean_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]

    cleaned = " ".join(lines)
    cleaned = cleaned.replace("•", "-")

    return cleaned.lower()

def normalize_skills(skills):
    """
    Converts list[str] OR list[dict] → list[str]
    """
    if not skills:
        return []

    if isinstance(skills[0], dict):
        return [s.get("name", "").lower() for s in skills if s.get("name")]

    return [s.lower() for s in skills]
