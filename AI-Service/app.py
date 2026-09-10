
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import uuid
from services.video_processor import extract_frames
from services.audio_processor import extract_audio
from services.speech_processor import transcribe_audio
from services.visual_analyzer import analyze_frames
from services.semantic_analyzer import analyze_transcript
from services.decision_engine import make_decision
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
         "https://repairnow.onrender.com",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEO_DIR = "temp/videos"

os.makedirs(VIDEO_DIR, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "RepairNow AI Service is running"
    }


@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    total_start = time.perf_counter()

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No video file provided."
        )
    print("Filename:", file.filename)
    print("MIME type:", file.content_type)
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
    start = time.perf_counter()

    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    upload_time = time.perf_counter() - start

    print(f"⏱ Upload: {upload_time:.2f}s")

    # --------------------------------------------------
    # Extract frames
    # --------------------------------------------------

    start = time.perf_counter()

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

    frame_time = time.perf_counter() - start

    print(f"⏱ Frame extraction: {frame_time:.2f}s")

    # --------------------------------------------------
    # Analyze extracted frames using YOLO
    # --------------------------------------------------

    start = time.perf_counter()

    try:
        visual_result = analyze_frames(
            frame_result["frames"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Visual analysis failed: {str(e)}"
        )

    yolo_time = time.perf_counter() - start

    print(f"⏱ YOLO: {yolo_time:.2f}s")

    # --------------------------------------------------
    # Decide whether Whisper is required
    # --------------------------------------------------

    phone_percentage = visual_result["phone_detection_percentage"]
    average_phone_confidence = visual_result["average_phone_confidence"]

    print(f"📱 Phone detection: {phone_percentage}%")
    print(
        f"🎯 Average phone confidence: "
        f"{average_phone_confidence}"
    )

    # --------------------------------------------------
    # Decide whether Whisper is required
    # --------------------------------------------------

    if phone_percentage < 11:
        # Definitely weak
        run_whisper = False
        decision = "INVALID"

    elif phone_percentage >= 60:
        # Definitely strong
        run_whisper = False
        decision = "VALID"

    else:
        # Uncertain → use audio
        run_whisper = True

    audio_result = {"audio_path": None}
    audio_time = 0.0
    whisper_time = 0.0
    semantic_time = 0.0
    decision_time = 0.0

    # --------------------------------------------------
    # Extract audio + Whisper
    # --------------------------------------------------

    if run_whisper:
        # ----------------------------------------------
        # Extract audio
        # ----------------------------------------------

        start = time.perf_counter()

        try:
            audio_result = extract_audio(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Audio extraction failed: {str(e)}"
            )

        audio_time = time.perf_counter() - start
        print(f"⏱ Audio extraction: {audio_time:.2f}s")

        # ----------------------------------------------
        # Convert audio to text
        # ----------------------------------------------

        start = time.perf_counter()

        try:
            speech_result = transcribe_audio(audio_result["audio_path"])
        except Exception as e:
            print("❌ WHISPER ERROR:", repr(e))
            raise HTTPException(
                status_code=500,
                detail=f"Speech recognition failed: {str(e)}"
            )

        whisper_time = time.perf_counter() - start
        print(f"⏱ Whisper: {whisper_time:.2f}s")
    else:
        speech_result = {
            "skipped": True,
            "reason": "Strong visual phone evidence"
        }

        print("⏭ Whisper skipped because strong visual phone evidence was detected.")

    # --------------------------------------------------
    # Analyze transcript
    # --------------------------------------------------

    if speech_result.get("skipped"):
        semantic_result = {
            "skipped": True,
            "reason": "Speech transcription was skipped"
        }
    else:
        start = time.perf_counter()

        try:
            semantic_result = analyze_transcript(speech_result["text"])
        except Exception as e:
            print("SEMANTIC ANALYSIS ERROR:", repr(e))
            raise HTTPException(
                status_code=500,
                detail=f"Semantic analysis failed: {str(e)}"
            )

        semantic_time = time.perf_counter() - start
        print(f"⏱ Semantic analysis: {semantic_time:.2f}s")

    # --------------------------------------------------
    # Make final decision
    # --------------------------------------------------

    start = time.perf_counter()

    try:
        decision_result = make_decision(
            visual_result,
            semantic_result,
            speech_result
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Decision engine failed: {str(e)}"
        )

    decision_time = time.perf_counter() - start
    print(f"⏱ Decision engine: {decision_time:.2f}s")

    # --------------------------------------------------
    # Total processing time
    # --------------------------------------------------

    total_time = time.perf_counter() - total_start

    print("\n========== VIDEO PIPELINE ==========")
    print(f"Upload:             {upload_time:.2f}s")
    print(f"Frame extraction:   {frame_time:.2f}s")
    print(f"YOLO:               {yolo_time:.2f}s")
    print(f"Audio extraction:   {audio_time:.2f}s")
    print(f"Whisper:            {whisper_time:.2f}s")
    print(f"Semantic analysis:  {semantic_time:.2f}s")
    print(f"Decision engine:    {decision_time:.2f}s")
    print("-----------------------------------")
    print(f"TOTAL:              {total_time:.2f}s")
    print("===================================\n")

    # --------------------------------------------------
    # Response
    # --------------------------------------------------

    return {
        "message": "Video analyzed successfully",
        "video": filename,
        "duration_seconds": frame_result["duration"],
        "number_of_frames": len(frame_result["frames"]),
        "frames": frame_result["frames"],
        "audio": audio_result["audio_path"],
        "visual_analysis": visual_result,
        "transcription": speech_result,
        "semantic_analysis": semantic_result,
        "decision": decision_result,
        "processing_time": {
            "upload": round(upload_time, 2),
            "frame_extraction": round(frame_time, 2),
            "yolo": round(yolo_time, 2),
            "audio_extraction": round(audio_time, 2),
            "whisper": round(whisper_time, 2),
            "semantic_analysis": round(semantic_time, 2),
            "decision_engine": round(decision_time, 2),
            "total": round(total_time, 2)
        }
    }
