import math

from faster_whisper import WhisperModel


# Small model suitable for local CPU testing
model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str):

    segments, info = model.transcribe(
        audio_path,
        beam_size=1,
        vad_filter=True
    )

    text_parts = []
    segment_confidences = []
    total_duration = 0.0

    for segment in segments:

        text_parts.append(segment.text.strip())

        # Faster-Whisper provides average_logprob.
        # Convert log probability into a 0-1 confidence approximation.
        confidence = min(
            max(math.exp(segment.avg_logprob), 0.0),
            1.0
        )

        segment_confidences.append(confidence)

        total_duration = max(
            total_duration,
            segment.end
        )

    transcript = " ".join(text_parts)

    average_confidence = (
        sum(segment_confidences) / len(segment_confidences)
        if segment_confidences
        else 0.0
    )

    return {
        "language": info.language,
        "text": transcript,
        "confidence": round(average_confidence * 100, 2),
        "duration_seconds": round(total_duration, 2),
        "segments": len(segment_confidences)
    }