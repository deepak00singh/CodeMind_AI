# CodeMind AI 🧠

> AI-powered code reviewer — paste code, get line-by-line bugs, optimizations, and explanations.

**Stack:** React 18 + Vite · Monaco Editor · Tailwind CSS v3 · FastAPI · OpenAI gpt-4o-mini

---

## Quick Start

### 1. Backend

```powershell
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI API key
copy .env.example .env
# Edit .env and add your key: OPENAI_API_KEY=sk-...

# Start server (run from inside backend/ directory)
python -m uvicorn main:app --reload --port 8000
```

> API available at http://localhost:8000  
> Docs at http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

> App available at http://localhost:5173

---

## Project Structure

```
codemind-ai/
├── backend/
│   ├── main.py                    # FastAPI app + CORS
│   ├── routes/analyze.py          # POST /api/analyze
│   ├── services/
│   │   ├── preprocessor.py        # Line numbering + validation
│   │   └── llm_client.py          # OpenAI call + JSON parsing + cache
│   ├── models/schemas.py          # Pydantic v2 schemas
│   ├── prompts/analysis_prompt.py # System + user prompts
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Main app shell
    │   ├── components/
    │   │   ├── CodeEditor.jsx     # Monaco editor wrapper
    │   │   ├── ResultsPanel.jsx   # Results layout
    │   │   ├── BugCard.jsx        # Bug display card
    │   │   ├── OptimizationCard.jsx
    │   │   └── ExplanationBlock.jsx
    │   ├── api/analyzeCode.js     # Fetch wrapper
    │   └── styles/index.css       # Tailwind + custom CSS
    ├── package.json
    └── vite.config.js
```

---

## API

### `POST /api/analyze`

**Request:**
```json
{
  "code": "def foo(): pass",
  "language": "auto"
}
```

**Response:**
```json
{
  "language": "python",
  "summary": "...",
  "overall_quality": "good",
  "bugs": [],
  "optimizations": [],
  "explanation": {
    "what_it_does": "...",
    "how_it_works": "...",
    "notable_patterns": "..."
  }
}
```

---

## Demo Code (for live demo)

```python
def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

result = calculate_average([])
print(result)
```

Expected: **Critical bug** on line 6 (ZeroDivisionError) + optimization to use `sum()`.

---

## Features

- 🔴 **Bug detection** — critical / warning / info severity with line numbers
- ⚡ **Optimizations** — 1-3 impactful improvements with code examples
- 💡 **Explanation** — what/how/patterns in plain English
- 📋 **Copy-to-clipboard** on all code blocks
- 🔍 **Auto language detection** — Python vs JavaScript
- 🧠 **In-memory caching** — identical code doesn't re-call the LLM
- 🎨 **Premium dark UI** — glass morphism, ambient gradients, animations

---

*Built for hackathon · Powered by GPT-4o-mini*
# CodeMind_AI
