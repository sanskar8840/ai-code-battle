from pymongo import MongoClient
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
from pathlib import Path

# -----------------------------
# MongoDB
# -----------------------------
client = MongoClient("mongodb://127.0.0.1:27017")

db = client["ai-code-battle-arena"]

users = db["users"]
problems = db["problems"]
submissions = db["submissions"]

# -----------------------------
# Load Data
# -----------------------------
problemMap = {}

for problem in problems.find():
    problemMap[str(problem["_id"])] = problem

rows = []

# -----------------------------
# Build Training Dataset
# -----------------------------
for submission in submissions.find():

    problem = problemMap.get(str(submission["problem"]))

    if not problem:
        continue

    rows.append({

        "difficulty": problem["difficulty"],

        "language": submission["language"],

        "executionTime":
            submission.get("runtimeMs", 100),

        "memory":
            submission.get("memoryKb", 1000),

        "accepted":
            1 if submission["status"] == "Accepted" else 0,

    })

# -----------------------------
# DataFrame
# -----------------------------
df = pd.DataFrame(rows)

print(df.head())

# -----------------------------
# Fill Missing Values
# -----------------------------
df["executionTime"] = df["executionTime"].fillna(
    df["executionTime"].median()
)

df["memory"] = df["memory"].fillna(
    df["memory"].median()
)

# -----------------------------
# Encode Categories
# -----------------------------
difficulty_encoder = LabelEncoder()

language_encoder = LabelEncoder()

df["difficulty"] = difficulty_encoder.fit_transform(
    df["difficulty"]
)

df["language"] = language_encoder.fit_transform(
    df["language"]
)

# -----------------------------
# Train Model
# -----------------------------
X = df[[
    "difficulty",
    "language",
    "executionTime",
    "memory"
]]

y = df["accepted"]

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

# -----------------------------
# Save Model
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent

joblib.dump(
    model,
    BASE_DIR / "model.pkl"
)

joblib.dump(
    {
        "difficulty": difficulty_encoder,
        "language": language_encoder,
    },
    BASE_DIR / "encoders.pkl"
)

print("\nModel trained successfully!")