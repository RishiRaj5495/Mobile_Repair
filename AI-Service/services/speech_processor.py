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
        beam_size=5
    )

    text_parts = []

    for segment in segments:
        text_parts.append(segment.text.strip())

    transcript = " ".join(text_parts)

    return {
        "language": info.language,
        "text": transcript
    }