from pymongo import MongoClient
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
from pathlib import Path

# -----------------------------
# MongoDB Connection
# -----------------------------
client = MongoClient("mongodb://127.0.0.1:27017")

db = client["ai-code-battle-arena"]

users = db["users"]
problems = db["problems"]
submissions = db["submissions"]

# -----------------------------
# Load Data
# -----------------------------
userList = list(users.find())
problemList = list(problems.find())
submissionList = list(submissions.find())

print(f"Users: {len(userList)}")
print(f"Problems: {len(problemList)}")
print(f"Submissions: {len(submissionList)}")

# -----------------------------
# Lookup Maps
# -----------------------------
userMap = {
    str(user["_id"]): user
    for user in userList
}

problemMap = {
    str(problem["_id"]): problem
    for problem in problemList
}

# -----------------------------
# Create Dataset
# -----------------------------
rows = []

for submission in submissionList:

    problem = problemMap.get(
        str(submission["problem"])
    )

    if problem is None:
        continue

    difficulty = problem["difficulty"]

    language = submission["language"]

    executionTime = submission.get(
        "runtimeMs",
        100
    )

    memory = submission.get(
        "memoryKb",
        1000
    )

    accepted = 1 if submission["status"] == "Accepted" else 0

    rows.append(
        {
            "difficulty": difficulty,
            "language": language,
            "executionTime": executionTime,
            "memory": memory,
            "accepted": accepted,
        }
    )

df = pd.DataFrame(rows)

print(df.head())
print(df.shape)
# -----------------------------
# Encode categorical columns
# -----------------------------
difficultyEncoder = LabelEncoder()
languageEncoder = LabelEncoder()

df["difficulty"] = difficultyEncoder.fit_transform(df["difficulty"])
df["language"] = languageEncoder.fit_transform(df["language"])

# -----------------------------
# Features
# -----------------------------
X = df[
    [
        "difficulty",
        "language",
        "executionTime",
        "memory",
    ]
]

# Target
y = df["accepted"]

print(X.head())
print(y.head())
# -----------------------------
# Fill Missing Values
# -----------------------------
X["executionTime"] = X["executionTime"].fillna(
    X["executionTime"].mean()
)

X["memory"] = X["memory"].fillna(
    X["memory"].mean()
)

# -----------------------------
# Train Model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

print("Model Trained Successfully!")

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
        "difficulty": difficultyEncoder,
        "language": languageEncoder,
    },
    BASE_DIR / "encoders.pkl"
)

print("model.pkl saved")
print("encoders.pkl saved")