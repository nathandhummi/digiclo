# tagger_api.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
import spacy
import io

app = FastAPI()

# 1) Enable CORS so browser/Expo web can call this endpoint without blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or restrict to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2) Load BLIP captioner once at startup
captioner = pipeline(
    "image-to-text",
    model="Salesforce/blip-image-captioning-base",
    device=-1   # change to 0 if you have a CUDA GPU
)

# 3) Load spaCy’s English model once at startup
nlp = spacy.load("en_core_web_sm")

# 4) Define words you never want in tags
STOP_NOUNS = {"man", "woman", "person", "model", "studio", "background", "people"}
STOP_ADJS  = {}  # add any adjectives you never want

def image_to_single_words_from_pil(img: Image.Image, top_k: int = 8):
    """
    Given a PIL.Image, run BLIP→spaCy to return up to `top_k` single-word tags.
    """
    result = captioner(img)
    if not result or "generated_text" not in result[0]:
        raise RuntimeError(f"Unexpected pipeline output: {result}")
    caption = result[0]["generated_text"].lower()
    doc = nlp(caption)

    seen = set()
    final_tags = []

    for token in doc:
        lemma = token.lemma_.strip().lower()
        # 1) If it’s an adjective, keep it (unless on STOP_ADJS)
        if token.pos_ == "ADJ" and lemma not in STOP_ADJS and len(lemma) > 1:
            if lemma not in seen:
                final_tags.append(lemma)
                seen.add(lemma)

        # 2) If it’s a noun/proper noun, keep it (unless on STOP_NOUNS)
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
