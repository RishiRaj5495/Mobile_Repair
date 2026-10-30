
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("NEBIUS_KEY")

if not api_key:
    raise RuntimeError(
        "NEBIUS_KEY is missing. Check your .env file."
    )

client = OpenAI(
    base_url="https://api.tokenfactory.us-north1.nebius.com/v1/",
    api_key=api_key,
    timeout=60.0,
    max_retries=1,
)


response = client.chat.completions.create(
    model="nvidia/Nemotron-3.5-Super-VL",
    messages=[
        {
            "role": "system",
            "content": (
                "You are a mobile phone repair assistant. "
                "Give concise, practical answers."
            ),
        },
        {
            "role": "user",
            "content": (
                "A phone overheats while charging. List three "
                "possible causes and three safe technician checks. "
                "Do not assume any fault is confirmed."
            ),
        },
    ],

    max_completion_tokens=2048,
    extra_body={
        "chat_template_kwargs": {
            "enable_thinking": False
        }
    },
)

message = response.choices[0].message

print("Response:", message.content)
print("Reasoning:", getattr(message, "reasoning", None))
print("Finish reason:", response.choices[0].finish_reason)

