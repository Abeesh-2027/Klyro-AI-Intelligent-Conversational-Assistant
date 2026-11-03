import pytest

from app.documents import best_chunks, extract_text, split_chunks
from app.text import clean_filename, clean_text, clean_title


def test_clean_text_removes_control_characters():
    assert clean_text("  hi\x00 there\x07\r\nbye  ") == "hi there\nbye"


def test_clean_title_removes_angle_brackets_and_extra_spaces():
    assert clean_title("<script>alert(1)</script>   my   chat") == "scriptalert(1)/script my chat"


def test_clean_filename_blocks_paths():
    assert clean_filename("../../etc/passwd") == "passwd"
    assert clean_filename("C:\\temp\\evil<>.txt") == "evil__.txt"
    assert clean_filename("   ") == "file"


def test_text_file_is_read():
    assert extract_text("notes.txt", b"hello world") == "hello world"


def test_wrong_type_is_rejected():
    with pytest.raises(ValueError):
        extract_text("run.exe", b"MZ")


def test_binary_data_is_rejected():
    with pytest.raises(ValueError):
        extract_text("fake.txt", b"abc\x00def")


def test_fake_pdf_is_rejected():
    with pytest.raises(ValueError):
        extract_text("fake.pdf", b"not a pdf")


def test_empty_file_is_rejected():
    with pytest.raises(ValueError):
        extract_text("empty.txt", b"   ")


def test_chunks_cover_the_text():
    chunks = split_chunks("a" * 2500)
    assert len(chunks) >= 3
    assert all(len(c) <= 1000 for c in chunks)


def test_best_chunks_prefers_matching_text():
    chunks = [
        {"name": "a.txt", "text": "cooking pasta with tomato sauce"},
        {"name": "a.txt", "text": "the capital of france is paris"},
        {"name": "a.txt", "text": "gardening tips for spring"},
    ]
    result = best_chunks("what is the capital of france", chunks, limit=1)
    assert result[0]["text"] == "the capital of france is paris"


def test_best_chunks_falls_back_to_the_start():
    chunks = [{"name": "a.txt", "text": f"section {i}"} for i in range(6)]
    result = best_chunks("summarize this", chunks, limit=2)
    assert [c["text"] for c in result] == ["section 0", "section 1"]
