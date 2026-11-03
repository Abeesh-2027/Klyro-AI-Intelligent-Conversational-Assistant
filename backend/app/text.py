import re

CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean_text(value: str) -> str:
    return CONTROL_CHARS.sub("", value.replace("\r\n", "\n")).strip()


def clean_title(value: str) -> str:
    value = re.sub(r"[<>]", "", clean_text(value))
    return re.sub(r"\s+", " ", value).strip()


def clean_filename(name: str) -> str:
    name = name.replace("\\", "/").split("/")[-1]
    name = re.sub(r"[^A-Za-z0-9._ -]", "_", name).strip(" .")
    return name[:100] or "file"
