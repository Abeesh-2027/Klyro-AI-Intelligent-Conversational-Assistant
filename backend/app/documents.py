import io
import re
from pathlib import Path

from pypdf import PdfReader

ALLOWED_TYPES = {".txt", ".md", ".csv", ".json", ".pdf"}
MAX_FILE_BYTES = 2 * 1024 * 1024
MAX_PDF_PAGES = 50
MAX_TEXT_CHARS = 200_000
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150


def extract_text(filename: str, data: bytes) -> str:
    kind = Path(filename).suffix.lower()
    if kind not in ALLOWED_TYPES:
        raise ValueError("Unsupported file type. Use .txt, .md, .csv, .json or .pdf.")

    if kind == ".pdf":
        if not data.startswith(b"%PDF"):
            raise ValueError("This file is not a real PDF.")
        try:
            reader = PdfReader(io.BytesIO(data))
            if reader.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported.")
            pages = reader.pages[:MAX_PDF_PAGES]
            text = "\n".join(page.extract_text() or "" for page in pages)
        except ValueError:
            raise
        except Exception:
            raise ValueError("Could not read this PDF.") from None
    else:
        if b"\x00" in data:
            raise ValueError("This file looks like binary data, not text.")
        text = data.decode("utf-8", errors="replace")

    text = text.replace("\x00", "").strip()[:MAX_TEXT_CHARS]
    if not text:
        raise ValueError("No readable text was found in this file.")
    return text


def split_chunks(text: str) -> list[str]:
    chunks = []
    step = CHUNK_SIZE - CHUNK_OVERLAP
    for start in range(0, len(text), step):
        piece = text[start:start + CHUNK_SIZE].strip()
        if piece:
            chunks.append(piece)
    return chunks


def words(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]{3,}", text.lower()))


def best_chunks(question: str, chunks: list[dict], limit: int = 4, max_chars: int = 6000) -> list[dict]:
    asked = words(question)
    ranked = sorted(
        ((len(asked & words(item["text"])), -index, index) for index, item in enumerate(chunks)),
        reverse=True,
    )
    picked = sorted(index for _, _, index in ranked[:limit])

    result, used = [], 0
    for index in picked:
        item = chunks[index]
        if used + len(item["text"]) > max_chars:
            break
        result.append(item)
        used += len(item["text"])
    return result
