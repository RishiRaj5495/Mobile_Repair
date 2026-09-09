import re


# Device keywords
DEVICE_KEYWORDS = {
    "phone": [
        "phone",
        "mobile",
        "smartphone",
        "iphone",
        "android",
        "samsung",
        "oneplus",
        "xiaomi",
        "redmi",
        "realme",
        "vivo",
        "oppo"
    ],

    "laptop": [
        "laptop",
        "notebook",
        "macbook",
        "hp laptop",
        "dell laptop",
        "lenovo laptop",
        "asus laptop",
        "acer laptop"
    ],

    "tablet": [
        "tablet",
        "ipad"
    ],

    "desktop": [
        "desktop",
        "computer",
        "pc"
    ]
}


# Repair/problem keywords
REPAIR_KEYWORDS = [
    # English
    "repair",
    "problem",
    "issue",
    "damage",
    "broken",
    "not working",
    "replace",
    "replacement",
    "change",
    "fix",
    "fault",
    "faulty",
    "repairing",
    "screen",
    "display",
    "battery",
    "charging",
    "charger",
    "charging port",
    "speaker",
    "microphone",
    "camera",
    "touch",
    "touchscreen",
    "motherboard",
    "board",
    "software",
    "update",
    "restart",
    "overheating",

    # Hindi / Hinglish
    "kharab",
    "kharaab",
    "tuta",
    "toota",
    "toot gaya",
    "toot gayi",
    "chal nahi raha",
    "kaam nahi kar raha",
    "kaam nahi kar rahi",
    "band hai",
    "band ho gaya",
    "band ho gayi",
    "garam",
    "zyada garam",
    "awaaz",
    "awaz",
    "charge nahi",
    "charge nahi ho raha",
    "charge nahi ho rahi",
    "charging nahi",
    "screen toot",
    "display kharab",
    "battery kharab",
    "battery problem",
    "charger kharab",
    "charger problem"
]


def normalize_text(text: str) -> str:

    text = text.lower()

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def find_matches(text, keywords):

    matches = []

    for keyword in keywords:

        if keyword in text:
            matches.append(keyword)

    return matches


def analyze_transcript(transcript: str):

    # Handle empty transcript
    if not transcript:
        return {
            "device": "unknown",
            "phone_related": False,
            "repair_related": False,
            "device_keywords": [],
            "phone_keywords": [],
            "repair_keywords": []
        }

    text = normalize_text(transcript)

    device_scores = {}

    # Analyze devices
    for device, keywords in DEVICE_KEYWORDS.items():

        matches = find_matches(text, keywords)

        device_scores[device] = {
            "matches": matches,
            "score": len(matches)
        }

    # Find device with highest keyword score
    detected_device = max(
        device_scores,
        key=lambda device: device_scores[device]["score"]
    )

    # If no device keyword matched
    if device_scores[detected_device]["score"] == 0:

        detected_device = "unknown"
        device_keywords = []

    else:

        device_keywords = device_scores[
            detected_device
        ]["matches"]

    # Repair keywords
    repair_matches = find_matches(
        text,
        REPAIR_KEYWORDS
    )

    # Phone keywords
    phone_matches = device_scores[
        "phone"
    ]["matches"]

    phone_related = len(phone_matches) > 0

    repair_related = len(repair_matches) > 0

    return {
        "device": detected_device,
        "phone_related": phone_related,
        "repair_related": repair_related,

        "device_keywords": device_keywords,

        "phone_keywords": phone_matches,

        "repair_keywords": repair_matches
    }







