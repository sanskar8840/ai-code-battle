from pymongo import MongoClient
import pandas as pd
import joblib
import json
from pathlib import Path
import sys

# -----------------------------
# User Data
# -----------------------------
userData = {}

if len(sys.argv) > 1:
    try:
        userData = json.loads(sys.argv[1])
    except Exception:
        userData = {}

favoriteTags = userData.get("favoriteTags", [])
difficultyPreference = userData.get("difficulty", {})
solvedProblems = set(userData.get("solvedProblems", []))
userId = userData.get("userId")

# -----------------------------
# Load Model
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "model.pkl")
encoders = joblib.load(BASE_DIR / "encoders.pkl")

difficulty_encoder = encoders["difficulty"]
language_encoder = encoders["language"]

# -----------------------------
# MongoDB
# -----------------------------
client = MongoClient("mongodb://127.0.0.1:27017")

db = client["ai-code-battle-arena"]

problemCollection = db["problems"]
submissionCollection = db["submissions"]

# -----------------------------
# Load Problems
# -----------------------------
problems = list(
    problemCollection.find(
        {
            "isPublished": True
        }
    )
)

# -----------------------------
# Load Current User Submissions
# -----------------------------
submissionQuery = {}

if userId:
    submissionQuery["user"] = userId

userSubmissions = list(
    submissionCollection.find(submissionQuery)
)

# -----------------------------
# User Average Runtime
# -----------------------------
runtimeList = [
    s.get("runtimeMs")
    for s in userSubmissions
    if s.get("runtimeMs") is not None
]

memoryList = [
    s.get("memoryKb")
    for s in userSubmissions
    if s.get("memoryKb") is not None
]

if len(runtimeList) > 0:
    avgRuntime = sum(runtimeList) / len(runtimeList)
else:
    avgRuntime = 100

if len(memoryList) > 0:
    avgMemory = sum(memoryList) / len(memoryList)
else:
    avgMemory = 1000

# -----------------------------
# Preferred Language
# -----------------------------
languageCount = {}

for s in userSubmissions:

    lang = s.get("language", "cpp")

    languageCount[lang] = (
        languageCount.get(lang, 0) + 1
    )

if languageCount:
    preferredLanguage = max(
        languageCount,
        key=languageCount.get,
    )
else:
    preferredLanguage = "cpp"

recommendations = []

# -----------------------------
# Predict Every Problem
# -----------------------------
for problem in problems:

    if (
        str(problem["_id"]) in solvedProblems
        or problem["slug"] in solvedProblems
    ):
        continue

    difficulty = problem["difficulty"]

    try:

        difficultyValue = difficulty_encoder.transform(
            [difficulty]
        )[0]

        languageValue = language_encoder.transform(
            [preferredLanguage]
        )[0]

    except Exception:
        continue

    sample = pd.DataFrame(
        [
            {
                "difficulty": difficultyValue,
                "language": languageValue,
                "executionTime": avgRuntime,
                "memory": avgMemory,
            }
        ]
    )

    proba = model.predict_proba(sample)[0]

    if len(model.classes_) == 1:

        if model.classes_[0] == 1:
            probability = float(proba[0])
        else:
            probability = 0.0

    else:
        probability = float(proba[1])

    # -----------------------------
    # Rule Scores
    # -----------------------------
    tagScore = 0

    for tag in problem.get("tags", []):

        if tag in favoriteTags:
            tagScore += 0.05

    difficultyScore = (
        difficultyPreference.get(
            difficulty,
            0
        ) * 0.01
    )

    # -----------------------------
    # Hybrid Score
    # -----------------------------
    finalScore = (
        probability
        + tagScore
        + difficultyScore
    )

    recommendations.append(
        {
            "_id": str(problem["_id"]),
            "title": problem["title"],
            "slug": problem["slug"],
            "difficulty": problem["difficulty"],
            "tags": problem.get("tags", []),
            "acceptanceRate": problem.get(
                "acceptanceRate",
                0,
            ),
            "mlScore": round(
                probability,
                4,
            ),
            "tagScore": round(
                tagScore,
                4,
            ),
            "difficultyScore": round(
                difficultyScore,
                4,
            ),
            "finalScore": round(
                finalScore,
                4,
            ),
        }
    )

# -----------------------------
# Sort
# -----------------------------
recommendations.sort(
    key=lambda x: x["finalScore"],
    reverse=True,
)

# -----------------------------
# Output
# -----------------------------
print(json.dumps(recommendations))