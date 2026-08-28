
from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import uuid
from services.video_processor import extract_frames
from services.audio_processor import extract_audio
from services.speech_processor import transcribe_audio
app = FastAPI()

VIDEO_DIR = "temp/videos"

os.makedirs(VIDEO_DIR, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "RepairNow AI Service is running"
    }


@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No video file provided."
        )

    # Check video type
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid video file."
        )

    # Get extension
    extension = os.path.splitext(file.filename)[1]

    if not extension:
        extension = ".mp4"

    # Generate unique filename
    filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        VIDEO_DIR,
        filename
    )

    # Save uploaded video
    with open(file_path, "wb") as buffer:

        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    # Extract frames
    try:

        frame_result = extract_frames(
            file_path,
            number_of_frames=10
        )




    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Frame extraction failed: {str(e)}"
        )
    try:

        audio_result = extract_audio(
          file_path
         )

    except Exception as e:

         raise HTTPException(
              status_code=500,
               detail=f"Audio extraction failed: {str(e)}"
          )
        # Convert audio to text
    try:

        speech_result = transcribe_audio(
            audio_result["audio_path"]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Speech recognition failed: {str(e)}"
        )     
    return {
        "message": "Video analyzed successfully",
        "video": filename,
        "duration_seconds": frame_result["duration"],
        "number_of_frames": len(frame_result["frames"]),
        "frames": frame_result["frames"],
        "audio": audio_result["audio_path"],
        "transcription": speech_result
    }