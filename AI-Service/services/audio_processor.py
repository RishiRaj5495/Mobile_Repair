import os
import subprocess
import uuid


AUDIO_DIR = "temp/audio"


def extract_audio(video_path: str):

    os.makedirs(AUDIO_DIR, exist_ok=True)

    job_id = str(uuid.uuid4())

    audio_path = os.path.join(
        AUDIO_DIR,
        f"{job_id}.wav"
    )

    command = [
        "ffmpeg",
        "-y",
        "-i", video_path,

        # Convert to mono
        "-ac", "1",

        # 16 kHz is commonly used for speech recognition
        "-ar", "16000",

        # WAV audio
        "-vn",

        audio_path
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Audio extraction failed: {result.stderr}"
        )

    return {
        "audio_path": audio_path
    }