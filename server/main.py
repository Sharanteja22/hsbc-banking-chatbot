# --- All imports at the top ---
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import intent_classifier
# Import from our other project files
from database import user_collection
from schemas import UserCreate, Token
import security
import rag_module

# Import and configure LLM
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- FastAPI App Initialization ---
app = FastAPI()

chat_histories = {}
# Add CORS middleware
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class ChatMessage(BaseModel):
    message: str

# --- Authentication Endpoints ---
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing_user = await user_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    hashed_password = security.get_password_hash(user.password)
    user_document = {"username": user.username, "hashed_password": hashed_password}
    await user_collection.insert_one(user_document)
    return {"message": "User created successfully"}

@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"username": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# # --- Protected Chat Endpoint (Final Version) ---
# @app.post("/chat")
# async def handle_chat(chat_message: ChatMessage, current_user: dict = Depends(security.get_current_user)):
#     user_message = chat_message.message

#     # 1. Greeting Intent
#     greetings = ['hello', 'hi', 'hey', 'greetings']
#     if user_message.lower().strip() in greetings:
#         return {"response": "Hello! I am the HSBC Digital Assistant. How can I assist you today?"}

#     # 2. Get Context from Pinecone (The "R" in RAG)
#     retrieved_context = rag_module.query_pinecone(user_message)

#     # 3. Generate Response with LLM (The "G" in RAG)
#     if retrieved_context:
#         try:
#             model = genai.GenerativeModel('gemini-1.5-flash')
#             prompt = f"You are a helpful and polite HSBC banking assistant. Use the following context to answer the user's question. If the context doesn't seem to fit the question, say you can't find specific information and suggest they rephrase.\n\nContext: {retrieved_context}\n\nQuestion: {user_message}"
#             completion = model.generate_content(prompt)
#             response_message = completion.text
#         except Exception as e:
#             print(f"Google Gemini API error: {e}")
#             response_message = "I am having trouble connecting to my AI brain right now. Please try again later."
#     else:
#         # If no relevant context was found in Pinecone
#         response_message = (
#             "I can't find specific information on that topic in my knowledge base. "
#             "For assistance, you can contact HSBC support at support@hsbc.com or call 1800-123-4567."
#         )

#     return {"response": response_message}

# --- Protected Chat Endpoint (Final Intelligent Version) ---

# --- Protected Chat Endpoint (Final Intelligent Version with NLU & Context Switching) ---





# @app.post("/chat")
# async def handle_chat(chat_message: ChatMessage, current_user: dict = Depends(security.get_current_user)):
#     username = current_user.get("username")
#     user_message = chat_message.message.strip()

#     # --- 0. Retrieve Chat History ---
#     if username not in chat_histories:
#         chat_histories[username] = []

#     history = chat_histories[username]

#     # --- 1. Simple Intent Check (Greetings & Help) ---
#     greetings = ['hello', 'hi', 'hey', 'greetings']
#     help_requests = ['help', 'how can you help', 'what can you do']

#     if user_message.lower() in greetings or user_message.lower() in help_requests:
#         response_text = (
#             "Hello! I am the HSBC Digital Assistant. I can help you with topics like:\n"
#             "● Applying for loans\n"
#             "● Blocking a lost or stolen debit/credit card\n"
#             "● Requesting account statements\n"
#             "● Asking about balances, charges, or interest rates"
#         )
#         history.append({"role": "user", "content": user_message})
#         history.append({"role": "assistant", "content": response_text})
#         return {"response": response_text}

#     # --- 2. Out-of-Scope Check ---
#     if not intent_classifier.is_banking_related(user_message):
#         response_text = "I am an HSBC banking assistant and can only answer questions related to our banking products and services."
#         history.append({"role": "user", "content": user_message})
#         history.append({"role": "assistant", "content": response_text})
#         return {"response": response_text}

#     # --- 3. NLU & Context Switching with Gemini ---
#     try:
#         nlu_model = genai.GenerativeModel('gemini-1.5-flash')

#         # Create a history string for the NLU prompt
#         history_for_prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-4:]]) # Use last 4 messages

#         nlu_prompt = (
#             f"Based on the following chat history and the user's current question, what is the user's real intent? "
#             f"Rewrite their question as a standalone, self-contained question. "
#             f"For example, if the history is 'assistant: We offer home loans and personal loans.' and the user asks 'what are the requirements for the second one?', "
#             f"you should output 'What are the requirements for a personal loan?'.\n\n"
#             f"Chat History:\n{history_for_prompt}\n\n"
#             f"User's Current Question: {user_message}\n\n"
#             f"Standalone Question:"
#         )

#         nlu_response = nlu_model.generate_content(nlu_prompt)
#         standalone_query = nlu_response.text.strip()
#         print(f"Original Query: '{user_message}' -> Standalone Query: '{standalone_query}'")

#     except Exception as e:
#         print(f"NLU (Gemini) Error: {e}")
#         standalone_query = user_message # Fallback to original message if NLU fails

#     # --- 4. RAG Search with the Refined Query ---
#     retrieved_context = rag_module.query_pinecone(standalone_query)

#     # --- 5. Final Response Generation with Gemini ---
#     if retrieved_context:
#         try:
#             generation_model = genai.GenerativeModel('gemini-1.5-flash')
#             generation_prompt = (
#                 f"You are a helpful and polite HSBC banking assistant. "
#                 f"Use the following provided context to answer the user's question. "
#                 f"Answer ONLY based on the context. If the context does not contain the answer, "
#                 f"politely state that you don't have that specific information and suggest contacting support.\n\n"
#                 f"Context: {retrieved_context}\n\n"
#                 f"User's Question: {user_message}" # Use original question for final answer
#             )

#             final_completion = generation_model.generate_content(generation_prompt)
#             response_text = final_completion.text
#         except Exception as e:
#             print(f"Generation (Gemini) Error: {e}")
#             response_text = "I'm having trouble generating a response right now. Please try again."
#     else:
#         response_text = (
#             "I can't find specific information on that topic in my knowledge base. "
#             "For detailed assistance, please contact HSBC support at support@hsbc.com or call 1800-123-4567."
#         )

#     # --- Update History and Return ---
#     history.append({"role": "user", "content": user_message})
#     history.append({"role": "assistant", "content": response_text})
#     # Keep only the last 10 messages to prevent memory issues
#     chat_histories[username] = history[-10:]

#     return {"response": response_text}



# --- Protected Chat Endpoint (Simplified RAG + LLM Fallback Version) ---

# --- Protected Chat Endpoint (Most Stable Version) ---
@app.post("/chat")
async def handle_chat(chat_message: ChatMessage, current_user: dict = Depends(security.get_current_user)):
    username = current_user.get("username")
    user_message = chat_message.message.strip()

    # --- 0. Retrieve Chat History ---
    if username not in chat_histories:
        chat_histories[username] = []
    history = chat_histories[username]

    # --- 1. Simple Intent Check (Greetings, Help, Reset) ---
    greetings = ['hello', 'hi', 'hey', 'greetings']
    help_requests = ['help', 'how can you help', 'what can you do']
    reset_commands = ['reset', 'start over', 'new topic', 'clear']

    if user_message.lower() in greetings or user_message.lower() in help_requests:
        response_text = (
            "Hello! I am the HSBC Digital Assistant. I can help you with topics like:\n"
            "● Applying for loans\n"
            "● Blocking a lost or stolen debit/credit card\n"
            "● Requesting account statements\n"
            "● Asking about balances, charges, or interest rates"
        )
        # For a new greeting, let's start the history fresh
        chat_histories[username] = [{"role": "user", "content": user_message}, {"role": "assistant", "content": response_text}]
        return {"response": response_text}
    
    if user_message.lower() in reset_commands:
        chat_histories[username] = []
        return {"response": "Ok, let's start a new conversation. How can I help you?"}

    # --- 2. Out-of-Scope Check on the RAW message ---
    # This is more reliable than checking after NLU.
    if not intent_classifier.is_banking_related(user_message):
        response_text = "I am an HSBC banking assistant and can only answer questions related to our banking products and services."
        # ... (history update and return logic is the same)
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": response_text})
        return {"response": response_text}

    # --- 3. NLU & Context Switching with a Better Prompt ---
    try:
        nlu_model = genai.GenerativeModel('gemini-1.5-flash')
        history_for_prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-4:]])
        
        # This new prompt is more robust and prioritizes the current question.
        nlu_prompt = (
            "Your task is to analyze a chat history and a user's current question. "
            "Rewrite the user's question into a clear, standalone query. "
            "The user's LATEST question is the most important. Use the history ONLY to resolve pronouns or vague references (like 'that one', 'what about it'). "
            "If the latest question is already clear, just repeat it.\n\n"
            f"Chat History:\n{history_for_prompt}\n\n"
            f"User's Current Question: {user_message}\n\n"
            f"Standalone Question:"
        )
        
        nlu_response = nlu_model.generate_content(nlu_prompt)
        standalone_query = nlu_response.text.strip()
        print(f"Original Query: '{user_message}' -> Standalone Query: '{standalone_query}'")
    except Exception as e:
        print(f"NLU (Gemini) Error: {e}")
        standalone_query = user_message

    # --- 4. RAG Search & 5. Final Generation (No changes here) ---
    retrieved_context = rag_module.query_pinecone(standalone_query)
    
    # if retrieved_context:
    #     try:
    #         generation_model = genai.GenerativeModel('gemini-1.5-flash')
    #         generation_prompt = (
    #             f"You are a helpful and polite HSBC banking assistant. "
    #             f"Use the following provided context to answer the user's question. "
    #             f"Answer ONLY based on the context.\n\n"
    #             f"Context: {retrieved_context}\n\n"
    #             f"User's Question: {user_message}"
    #         )
    #         final_completion = generation_model.generate_content(generation_prompt)
    #         response_text = final_completion.text
    #     except Exception as e:
    #         print(f"Generation (Gemini) Error: {e}")
    #         response_text = "I'm having trouble generating a response right now."
    # else:
    #     response_text = (
    #         "I can't find specific information on that topic in my knowledge base. "
    #         "For detailed assistance, please contact HSBC support at support@hsbc.com."
    #     )

    # # --- Update History and Return ---
    # history.append({"role": "user", "content": user_message})
    # history.append({"role": "assistant", "content": response_text})
    # chat_histories[username] = history[-10:]
    # return {"response": response_text}
    
    if retrieved_context:
        try:
            generation_model = genai.GenerativeModel('gemini-1.5-flash')
            # This prompt uses our own factual data
            generation_prompt = (
                f"You are a helpful and polite HSBC banking assistant. "
                f"Strictly use the following context to answer the user's question.\n\n"
                f"Context: {retrieved_context}\n\n"
                f"User's Question: {user_message}"
            )
            final_completion = generation_model.generate_content(generation_prompt)
            response_text = final_completion.text
        except Exception as e:
            print(f"Generation (Gemini) Error: {e}")
            response_text = "I'm having trouble generating a response right now."
    else:
        # SECOND, if no context was found, use Gemini as a general help desk
        print(f"No specific context found. Using Gemini as a fallback for: '{standalone_query}'")
        try:
            fallback_model = genai.GenerativeModel('gemini-1.5-flash')
            # This prompt asks Gemini to act as a general help desk
            fallback_prompt = (
                f"You are a helpful HSBC banking assistant. You could not find a specific document in the knowledge base to answer the user's question. "
                f"Provide a general, helpful answer to the user's query. Advise them to visit the official HSBC website or call support for specific details.\n\n"
                f"User's Question: {user_message}"
            )
            fallback_completion = fallback_model.generate_content(fallback_prompt)
            response_text = fallback_completion.text
        except Exception as e:
            print(f"Fallback (Gemini) Error: {e}")
            response_text = "I can't find specific information on that topic, and I'm having trouble connecting to my AI brain. Please contact HSBC support directly."

    # --- Update History and Return ---
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": response_text})
    chat_histories[username] = history[-10:]
    return {"response": response_text}