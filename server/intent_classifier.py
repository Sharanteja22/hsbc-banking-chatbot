from transformers import pipeline

# This loads a pre-trained model from Hugging Face. 
# It only happens once when the server starts.
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def is_banking_related(query: str) -> bool:
    """
    Uses a zero-shot model to classify if a query is related to banking.
    """
    candidate_labels = ["banking and finance", "general conversation"]
    result = classifier(query, candidate_labels)

    # Check the top label and its score
    top_label = result['labels'][0]
    top_score = result['scores'][0]

    print(f"Intent classification for '{query}': {top_label} (Score: {top_score:.2f})")

    # If the top label is 'banking and finance' and the score is reasonably high,
    # we consider it a valid banking question.
    if top_label == "banking and finance" and top_score > 0.60:
        return True
    else:
        return False