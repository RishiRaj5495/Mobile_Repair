import os
import subprocess
import uuid


FRAME_DIR = "temp/frames"


def extract_frames(video_path: str, number_of_frames: int = 10):
    """
    Extract representative frames from a video using FFmpeg.
    """

    os.makedirs(FRAME_DIR, exist_ok=True)

    # Create a unique folder for this video
    job_id = str(uuid.uuid4())
    output_dir = os.path.join(FRAME_DIR, job_id)

    os.makedirs(output_dir, exist_ok=True)

    # Get video duration using FFprobe
    probe_command = [
        "ffprobe",
        "-v", "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        video_path
    ]

    result = subprocess.run(
        probe_command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError("Unable to read video information.")

    duration = float(result.stdout.strip())

    if duration <= 0:
        raise RuntimeError("Invalid video duration.")

    # Calculate interval between frames
    interval = duration / number_of_frames

    frame_paths = []

    for i in range(number_of_frames):

        timestamp = i * interval

        output_file = os.path.join(
            output_dir,
            f"frame_{i + 1:03d}.jpg"
        )

        command = [
            "ffmpeg",
            "-y",
            "-ss", str(timestamp),
            "-i", video_path,
            "-frames:v", "1",
            "-q:v", "2",
            output_file
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"Failed to extract frame {i + 1}"
            )

        frame_paths.append(output_file)

    return {
        "job_id": job_id,
        "duration": duration,
        "frames": frame_paths
    }