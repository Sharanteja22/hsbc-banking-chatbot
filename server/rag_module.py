from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize connections
try:
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pc = Pinecone(api_key=pinecone_api_key)
    index_name = 'hsbc-faq'
    index = pc.Index(index_name)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Pinecone and SentenceTransformer initialized successfully.")
except Exception as e:
    print(f"Error during initialization: {e}")
    index = None
    model = None

def query_pinecone(user_query: str) -> str:
    """
    Takes a user query, finds the most relevant answer from Pinecone,
    and returns the answer text as context.
    """
    if not model or not index:
        return "System not initialized. Please check server logs."
    try:
        query_embedding = model.encode(user_query).tolist()
        query_result = index.query(
            vector=query_embedding,
            top_k=1,
            include_metadata=True
        )
        if query_result['matches']:
            best_match = query_result['matches'][0]
            if best_match['score'] > 0.65: # Confidence threshold
                return best_match['metadata']['answer']
        return None # Return None if no confident match is found
    except Exception as e:
        print(f"Error querying Pinecone: {e}")
        return "There was an error querying the knowledge base."