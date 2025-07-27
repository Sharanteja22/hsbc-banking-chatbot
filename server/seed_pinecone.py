import pandas as pd
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# --- 1. Initialize Connections (Simpler Version) ---
pinecone_api_key = os.getenv("PINECONE_API_KEY")

if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY must be set in your .env file")

# The client is initialized with only the API key
pc = Pinecone(api_key=pinecone_api_key)
index_name = 'hsbc-faq'

print("Connecting to Pinecone index...")
# Check if the index exists, and connect to it
if index_name not in pc.list_indexes().names():
    raise ValueError(f"Index '{index_name}' does not exist in Pinecone. Please create it in the dashboard first.")
index = pc.Index(index_name)

# Give it a moment to ensure the connection is ready
time.sleep(1)

# Initialize the sentence embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Models and connections initialized successfully.")

# --- 2. Load and Prepare Data ---
try:
    df = pd.read_csv('BankFAQs.csv')
    print(f"Loaded {len(df)} rows from BankFAQs.csv")
except FileNotFoundError:
    print("Error: BankFAQs.csv not found.")
    exit()

# --- 3. Create Embeddings and Upload to Pinecone ---
batch_size = 100 # Process records in batches
for i in range(0, len(df), batch_size):
    batch_df = df.iloc[i:i+batch_size]
    
    # Get the questions from the batch
    questions = batch_df['Question'].tolist()
    
    # Create embeddings for the questions
    embeddings = model.encode(questions)
    
    # Prepare data for Pinecone upsert
    vectors_to_upsert = []
    for j, row in enumerate(batch_df.itertuples()):
        vector_id = str(row.Index) # Use the original dataframe index as a unique ID
        embedding = embeddings[j].tolist()
        
        # Store the original question and answer as metadata
        metadata = {
            "question": row.Question,
            "answer": row.Answer
        }
        
        vectors_to_upsert.append((vector_id, embedding, metadata))
    
    # Upsert the batch to Pinecone
    index.upsert(vectors=vectors_to_upsert)
    print(f"Uploaded batch starting with index {i} to Pinecone.")

print("\nSeeding complete! Your Pinecone index is ready.")