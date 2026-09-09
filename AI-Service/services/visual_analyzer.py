# from ultralytics import YOLO

# # Load YOLO model once when the service starts
# model = YOLO("yolo11n.pt")


# def analyze_frames(frame_paths):

#     phone_frames = 0
#     total_frames = len(frame_paths)

#     detections = []

#     for index, frame_path in enumerate(frame_paths, start=1):

#         results = model.predict(
#             source=frame_path,
#             conf=0.25,
#             imgsz=640,
#             verbose=False
#         )

#         frame_detections = []

#         for result in results:

#             for box in result.boxes:

#                 class_id = int(box.cls[0])
#                 confidence = float(box.conf[0])
#                 name = result.names[class_id]

#                 frame_detections.append({
#                     "object": name,
#                     "confidence": round(confidence, 2)
#                 })

#         found_phone = any(
#             detection["object"] == "cell phone"
#             for detection in frame_detections
#         )

#         if found_phone:
#             phone_frames += 1

#         detections.append({
#             "frame": index,
#             "detections": frame_detections
#         })

#     phone_percentage = (
#         phone_frames / total_frames * 100
#         if total_frames > 0
#         else 0
#     )

#     return {
#         "total_frames": total_frames,
#         "phone_frames": phone_frames,
#         "phone_detection_percentage": round(phone_percentage, 2),
#         "detections": detections
#     }

from ultralytics import YOLO

# Load YOLO model once when the service starts
model = YOLO("yolo11n.pt")


def analyze_frames(frame_paths):

    phone_frames = 0
    total_frames = len(frame_paths)

    # Store the BEST phone confidence from each frame
    frame_phone_confidences = []

    detections = []

    for index, frame_path in enumerate(frame_paths, start=1):

        results = model.predict(
            source=frame_path,
            conf=0.25,
            imgsz=640,
            verbose=False
        )

        frame_detections = []

        # Store phone confidences for THIS frame only
        current_frame_phone_confidences = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                name = result.names[class_id]

                frame_detections.append({
                    "object": name,
                    "confidence": round(confidence, 2)
                })

                # -----------------------------------------
                # Collect phone confidence for this frame
                # -----------------------------------------

                if name == "cell phone":
                    current_frame_phone_confidences.append(
                        confidence
                    )

        # -----------------------------------------
        # Check whether this frame contains a phone
        # -----------------------------------------

        if current_frame_phone_confidences:

            phone_frames += 1

            # Use ONLY the strongest phone detection
            # from this frame
            best_phone_confidence = max(
                current_frame_phone_confidences
            )

            frame_phone_confidences.append(
                best_phone_confidence
            )

        detections.append({
            "frame": index,
            "detections": frame_detections
        })

    # -----------------------------------------
    # Phone detection percentage
    # -----------------------------------------

    phone_percentage = (
        phone_frames / total_frames * 100
        if total_frames > 0
        else 0
    )

    # -----------------------------------------
    # Average BEST confidence per frame
    # -----------------------------------------

    average_phone_confidence = (
        sum(frame_phone_confidences)
        / len(frame_phone_confidences)
        if frame_phone_confidences
        else 0
    )

    return {
        "total_frames": total_frames,
        "phone_frames": phone_frames,

        "phone_detection_percentage": round(
            phone_percentage,
            2
        ),

        "average_phone_confidence": round(
            average_phone_confidence,
            2
        ),

        "detections": detections
    }
    