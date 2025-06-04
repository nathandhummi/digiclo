cs 188 digital closet app

nathan dhami, amber lim, melody myae, cody lejang

# Running the App

In the home directory, run
   1. npm install
   2. pip install -r requirements.txt

Open up another terminal and cd to the backend directory. Then run
   1. npm install
   2. npm run dev

Open up another terminal and cd to the backend. Run
   1. uvicorn tagger_api:app --host 0.0.0.0 --port 8000

Open up another terminal and in the home directory, run
   1. npm run tunnel

Finally, in the home directory (in a fourth terminal), run
   1. npx expo start

## NOTE: The images will not show up as you need the MONGO URI and Cloudinary API key and secret.
### Our team will provide that if needed
