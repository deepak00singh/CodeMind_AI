MAX_LINES = 200


class CodeTooLongError(ValueError):
    pass


class EmptyCodeError(ValueError):
    pass


def preprocess_code(code: str, language: str = "auto") -> tuple[str, str]:
    """
    Returns (numbered_code, detected_language).
    Raises CodeTooLongError or EmptyCodeError on invalid input.
    """
    # Strip trailing whitespace but preserve structure
    lines = code.rstrip().split("\n")

    if not any(line.strip() for line in lines):
        raise EmptyCodeError("Code cannot be empty.")

    if len(lines) > MAX_LINES:
        raise CodeTooLongError(
            f"Code exceeds {MAX_LINES} lines. Got {len(lines)} lines. "
            f"Please trim your code for V1."
        )

    # Add line numbers: "  1 | code here"
    numbered_lines = [f"{i+1:3} | {line}" for i, line in enumerate(lines)]
    numbered_code = "\n".join(numbered_lines)

    # Language detection if "auto"
    if language == "auto":
        language = _detect_language(code)

    return numbered_code, language


def _detect_language(code: str) -> str:
    python_signals = ["def ", "import ", "print(", "elif ", "    ", "#"]
    js_signals = ["const ", "let ", "var ", "=>", "function ", "console.log"]

    py_score = sum(1 for s in python_signals if s in code)
    js_score = sum(1 for s in js_signals if s in code)

    return "python" if py_score >= js_score else "javascript"
