# from ultralytics import YOLO
# from pathlib import Path

# model = YOLO("yolo11n.pt")

# videos_dir = Path("temp/videos")

# for video in sorted(videos_dir.glob("*.mp4")):

#     print("\n" + "=" * 60)
#     print(f"VIDEO: {video.name}")
#     print("=" * 60)

#     results = model.predict(
#         source=str(video),
#         conf=0.25,
#         stream=True,
#         verbose=False
#     )

#     phone_frames = 0
#     total_frames = 0

#     for result in results:
#         total_frames += 1

#         found_phone = False

#         for box in result.boxes:
#             class_id = int(box.cls[0])
#             confidence = float(box.conf[0])
#             name = result.names[class_id]

#             print(f"Frame {total_frames}: {name} ({confidence:.2f})")

#             if name == "cell phone":
#                 found_phone = True

#         if found_phone:
#             phone_frames += 1

#     print(f"\nPhone detected in {phone_frames}/{total_frames} frames")

from ultralytics import YOLO
from pathlib import Path
import cv2

model = YOLO("yolo11n.pt")

videos_dir = Path("temp/videos")

for video in sorted(videos_dir.glob("*.mp4")):

    print("\n" + "=" * 60)
    print(f"VIDEO: {video.name}")
    print("=" * 60)

    cap = cv2.VideoCapture(str(video))

    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_video_frames == 0:
        print("Could not read video.")
        cap.release()
        continue

    # Select exactly 10 frames evenly across the video
    frame_numbers = [
        int(i * (total_video_frames - 1) / 9)
        for i in range(10)
    ]

    phone_frames = 0

    for i, frame_number in enumerate(frame_numbers, start=1):

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

        success, frame = cap.read()

        if not success:
            print(f"Frame {i}: Could not read")
            continue

        results = model.predict(
            source=frame,
            conf=0.25,
            verbose=False
        )

        found_phone = False

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                name = result.names[class_id]

                print(
                    f"Sample Frame {i}: "
                    f"{name} ({confidence:.2f})"
                )

                if name == "cell phone":
                    found_phone = True

        if found_phone:
            phone_frames += 1

    cap.release()

    percentage = (phone_frames / 10) * 100

    print(f"\nPhone detected in {phone_frames}/10 frames")
    print(f"Phone detection percentage: {percentage:.2f}%")