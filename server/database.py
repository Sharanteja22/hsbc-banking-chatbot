import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS")

if not MONGO_DETAILS:
    print("Error: MONGO_DETAILS not found in .env file")
    exit()

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.hsbc_db
print("Successfully connected to MongoDB Atlas!")

# This is the new line you added
user_collection = database.get_collection("users")