
import os
from openai import OpenAI

MODEL = "nvidia/Nemotron-3.5-Super-VL"

def get_nebius_client():
    api_key = os.getenv("NEBIUS_KEY")

    if not api_key:
        raise RuntimeError("NEBIUS_API_KEY is not configured")

    return OpenAI(
        base_url="https://api.tokenfactory.us-north1.nebius.com/v1/",
        api_key=api_key,
        timeout=30.0,
        max_retries=1,
    )


def generate_repair_summary(analysis: dict) -> str:
    client = get_nebius_client()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You assist mobile repair technicians. "
                    "Summarize only the supplied video-analysis evidence. "
                    "Separate observed evidence from possible causes. "
                    "Never claim a hardware fault is confirmed without "
                    "sufficient evidence. Suggest practical technician "
                    "checks. If evidence is insufficient, say so."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Analyze these video-processing results and produce "
                    "a concise repair assessment:\n"
                    f"{analysis}"
                ),
            },
        ],
        max_completion_tokens=300,
    )

    message = response.choices[0].message
    summary = message.content

    if not summary:
        raise RuntimeError(
            "Nebius returned no text. "
            f"Finish reason: {response.choices[0].finish_reason}"
        )

    return summary.strip()
