
# def make_decision(visual_result, semantic_result):

#     phone_percentage = visual_result.get(
#         "phone_detection_percentage", 0
#     )

#     device = semantic_result.get(
#         "device", "unknown"
#     )

#     phone_related = semantic_result.get(
#         "phone_related", False
#     )

#     repair_related = semantic_result.get(
#         "repair_related", False
#     )

#     # --------------------------------------------------
#     # CASE 1: Explicitly identified as another device
#     # --------------------------------------------------

#     if device in ["laptop", "tablet", "desktop"] and not phone_related:

#         return {
#             "status": "INVALID",
#             "reason": f"Video appears to be about a {device}, not a phone.",
#             "score": 0
#         }

#     # --------------------------------------------------
#     # Calculate score
#     # --------------------------------------------------

#     score = 0

#     # YOLO visual evidence
#     if phone_percentage >= 70:
#         score += 60

#     elif phone_percentage >= 40:
#         score += 45

#     elif phone_percentage >= 20:
#         score += 30

#     elif phone_percentage > 0:
#         score += 15

#     # Semantic phone evidence
#     if phone_related:
#         score += 25

#     # Repair/problem evidence
#     if repair_related:
#         score += 15

#     # --------------------------------------------------
#     # CASE 2: Valid phone repair video
#     # --------------------------------------------------

#     if score >= 60 and repair_related:

#         return {
#             "status": "VALID",
#             "reason": "Phone-related repair problem detected.",
#             "score": score
#         }

#     # --------------------------------------------------
#     # CASE 3: Phone detected but repair context unclear
#     # --------------------------------------------------

#     if phone_percentage >= 40:

#         return {
#             "status": "REVIEW",
#             "reason": "Phone detected, but repair-related content was not clearly identified.",
#             "score": score
#         }

#     # --------------------------------------------------
#     # CASE 4: Weak evidence
#     # --------------------------------------------------

#     return {
#         "status": "INVALID",
#         "reason": "Insufficient evidence of a phone-related repair problem.",
#         "score": score
#     }


def make_decision(
    visual_result,
    semantic_result,
    speech_result=None
):
    """
    Combine YOLO, semantic analysis, and optional Whisper
    information to make the final video validation decision.
    """

    # --------------------------------------------------
    # Get visual evidence
    # --------------------------------------------------

    phone_percentage = visual_result.get(
        "phone_detection_percentage", 0
    )

    # --------------------------------------------------
    # Get semantic evidence
    # --------------------------------------------------

    device = semantic_result.get(
        "device", "unknown"
    )

    phone_related = semantic_result.get(
        "phone_related", False
    )

    repair_related = semantic_result.get(
        "repair_related", False
    )

    # --------------------------------------------------
    # Get speech information
    # --------------------------------------------------

    if speech_result is None:
        speech_result = {}

    speech_confidence = speech_result.get(
        "confidence", 0
    )

    transcript = speech_result.get(
        "text", ""
    )

    # --------------------------------------------------
    # CASE 1
    # Clearly another device
    # --------------------------------------------------

    if device in ["laptop", "tablet", "desktop"] and not phone_related:

        return {
            "status": "INVALID",
            "reason": f"Video appears to be about a {device}, not a phone.",
            "score": 0
        }

    # --------------------------------------------------
    # Calculate score
    # --------------------------------------------------

    score = 0

    # YOLO visual evidence
    if phone_percentage >= 70:
        score += 60

    elif phone_percentage >= 40:
        score += 45

    elif phone_percentage >= 20:
        score += 30

    elif phone_percentage > 0:
        score += 15

    # Semantic phone evidence
    if phone_related:
        score += 25

    # Repair evidence
    if repair_related:
        score += 15

    # --------------------------------------------------
    # Speech quality
    # --------------------------------------------------
    # Speech confidence is supporting evidence only.
    # It does NOT mean phone detection confidence.

    if speech_confidence >= 70:
        score += 5

    # Keep maximum score at 100
    score = min(score, 100)

    # --------------------------------------------------
    # CASE 2
    # Strong phone repair evidence
    # --------------------------------------------------

    if score >= 60 and repair_related:

        return {
            "status": "VALID",
            "reason": "Phone-related repair problem detected.",
            "score": score
        }

    # --------------------------------------------------
    # CASE 3
    # Phone detected but repair context unclear
    # --------------------------------------------------

    if phone_percentage >= 40:

        return {
            "status": "REVIEW",
            "reason": (
                "Phone detected, but repair-related "
                "content was not clearly identified."
            ),
            "score": score
        }

    # --------------------------------------------------
    # CASE 4
    # Weak evidence
    # --------------------------------------------------

    return {
        "status": "INVALID",
        "reason": (
            "Insufficient evidence of a "
            "phone-related repair problem."
        ),
        "score": score
    }