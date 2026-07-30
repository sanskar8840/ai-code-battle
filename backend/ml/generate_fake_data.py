from pymongo import MongoClient
from bson import ObjectId
import random

# -----------------------
# MongoDB
# -----------------------

client = MongoClient("mongodb://127.0.0.1:27017")
db = client["ai-code-battle-arena"]

problemCollection = db["problems"]
behaviorCollection = db["userbehaviors"]

# -----------------------
# Existing Problems
# -----------------------

problems = list(problemCollection.find())

if len(problems) == 0:
    print("No Problems Found")
    exit()

# -----------------------
# Fake Users
# -----------------------

users = [
    ObjectId(),
    ObjectId(),
    ObjectId(),
    ObjectId(),
    ObjectId(),
    ObjectId(),
    ObjectId(),
    ObjectId(),
]

languages = [
    "cpp",
    "java",
    "python",
]

fakeData = []

for i in range(1000):

    problem = random.choice(problems)

    difficulty = problem["difficulty"]

    # -----------------------
    # Acceptance Probability
    # -----------------------

    if difficulty == "Easy":
        accepted = random.random() < 0.90
        execution = random.randint(5,20)
        memory = random.randint(800,2000)

    elif difficulty == "Medium":
        accepted = random.random() < 0.65
        execution = random.randint(20,80)
        memory = random.randint(1500,4000)

    else:

        accepted = random.random() < 0.35
        execution = random.randint(80,300)
        memory = random.randint(3000,9000)

    fakeData.append({

        "user": random.choice(users),

        "problem": problem["_id"],

        "difficulty": difficulty,

        "tags": problem["tags"],

        "language": random.choice(languages),

        "accepted": accepted,

        "executionTime": execution,

        "memory": memory,

    })

behaviorCollection.insert_many(fakeData)

print("Inserted", len(fakeData), "Fake User Behaviors")