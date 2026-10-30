
import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "nvidia/Nemotron-3.5-Super-VL"


def get_nebius_client():
    api_key = os.getenv("NEBIUS_KEY") or os.getenv("NEBIUS_API_KEY")

    if not api_key:
        raise RuntimeError("NEBIUS_KEY is not configured")

    return OpenAI(
        base_url="https://api.tokenfactory.us-north1.nebius.com/v1/",
        api_key=api_key,
        timeout=60.0,
        max_retries=1,
    )


def generate_repair_summary(analysis: dict) -> str:
    if not analysis:
        raise ValueError("No analysis data was provided")

    client = get_nebius_client()

    analysis_text = json.dumps(
        analysis,
        ensure_ascii=False,
        default=str,
        sort_keys=True,
    )[:12000]

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You assist mobile phone repair technicians. "
                    "Use only the supplied evidence. "
                    "Separate observed evidence from possible causes. "
                    "Do not invent faults or claim a fault is confirmed "
                    "without sufficient evidence. "
                    "Suggest practical and safe technician checks. "
                    "If evidence is insufficient, say so. "
                    "Return a concise assessment with these sections: "
                    "Observed Evidence, Possible Causes, Recommended Checks."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Generate a repair assessment from these "
                    "video-analysis results:\n" + analysis_text
                ),
            },
        ],
        max_tokens=1024,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False
            }
        },
    )

    summary = response.choices[0].message.content

    if not summary or not summary.strip():
        finish_reason = response.choices[0].finish_reason
        raise RuntimeError(
            f"Nemotron returned no text. Finish reason: {finish_reason}"
        )

    return summary.strip()

