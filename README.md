# Audio Word Cloud - Backend

The backend API for Audio Word Cloud.

It receives recorded or uploaded audio from the frontend, sends the audio to Groq Whisper for transcription, processes the transcript to identify useful terms, and returns the transcript and word cloud data to the frontend.

## What I built

The backend supports:

- Receiving audio files from the frontend
- MP3, WAV, M4A, AAC, OGG, WEBM and FLAC audio formats
- Maximum 25 MB file size
- Audio transcription using Groq Whisper
- Removing common stop words and filler words
- Normalising related terms where possible
- Extracting useful topics instead of only counting raw word frequency
- Returning the transcript and extracted terms as JSON
- CORS configuration for the frontend
- File upload validation
- Error handling for invalid files and failed analysis requests

The backend is working with the separate frontend repository.

## How to run locally

### 1. Clone the backend repository

```bash
git clone <YOUR_BACKEND_REPOSITORY_URL>
cd https://github.com/navaskm/Finquo-Ass-Backend

Libraries and external components

The following libraries and services were used:
  Express
  Multer
  CORS
  dotenv
  Groq API
  Nodemon for development