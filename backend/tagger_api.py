# tagger_api.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import spacy
import torch
import io

app = FastAPI()

# 1) Enable CORS so browser/Expo web can call this endpoint without blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2) Load BLIP processor/model once at startup
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
model.eval()
if torch.cuda.is_available():
    model.to("cuda")

# 3) Load spaCy’s English model once at startup
nlp = spacy.load("en_core_web_sm")

# 4) Define words you never want in tags
STOP_NOUNS = {"man", "woman", "person", "model", "studio", "background", "people"}
STOP_ADJS = set()

# 5) Use a minimal prompt so BLIP focuses on describing the garment
CLOTHING_PROMPT = "the clothing item is"

# 6) Precompute the set of prompt‐words (lemmas) to filter out if echoed
_prompt_doc = nlp(CLOTHING_PROMPT.lower())
PROMPT_WORDS = {token.lemma_.strip().lower() for token in _prompt_doc if token.is_alpha}


def image_to_single_words_from_pil(img: Image.Image, top_k: int = 8):
    """
    Given a PIL.Image, run BLIP→spaCy to return up to `top_k` single-word tags,
    using a short prompt so BLIP describes the image. We filter out any tokens
    that appear in the prompt itself or contain non-alphabetic characters.
    """
    # Prepare inputs with minimal prompt
    inputs = processor(img, text=CLOTHING_PROMPT, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

    # Generate a caption with room for new tokens
    out_ids = model.generate(
        **inputs,
        max_new_tokens=50,
        no_repeat_ngram_size=2,
        early_stopping=True
    )

    # Decode and lowercase
    raw_text = processor.decode(out_ids[0], skip_special_tokens=True).lower().strip()

    # Remove the prompt prefix if it was echoed
    if raw_text.startswith(CLOTHING_PROMPT):
        caption = raw_text[len(CLOTHING_PROMPT):].strip()
    else:
        caption = raw_text

    # Run spaCy on the cleaned caption
    doc = nlp(caption)
    seen = set()
    final_tags = []

    for token in doc:
        lemma = token.lemma_.strip().lower()

        # Skip tokens that come from the prompt
        if lemma in PROMPT_WORDS:
            continue

        # Only keep purely alphabetic tokens
        if not token.text.isalpha():
            continue

        # 1) If it’s an adjective, keep it (unless in STOP_ADJS)
        if token.pos_ == "ADJ" and lemma not in STOP_ADJS and len(lemma) > 1:
            if lemma not in seen:
                final_tags.append(lemma)
                seen.add(lemma)

        # 2) If it’s a noun/proper noun, keep it (unless in STOP_NOUNS)
        elif token.pos_ in {"NOUN", "PROPN"} and lemma not in STOP_NOUNS and len(lemma) > 1:
            if lemma not in seen:
                final_tags.append(lemma)
                seen.add(lemma)

        if len(final_tags) >= top_k:
            break

    return final_tags[:top_k]


@app.post("/tag-image")
async def tag_image(file: UploadFile = File(...), top_k: int = 8):
    """
    Accepts an uploaded image file (multipart/form-data) and returns JSON {"tags": […]}.
    """
    content = await file.read()
    img = Image.open(io.BytesIO(content)).convert("RGB")
    tags = image_to_single_words_from_pil(img, top_k=top_k)
    return {"tags": tags}
