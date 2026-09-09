from ultralytics import YOLO
from pathlib import Path

model = YOLO("yolo11n.pt")

frames_root = Path("temp/frames")

for video_dir in sorted(frames_root.iterdir()):

    if not video_dir.is_dir():
        continue

    print("\n" + "=" * 60)
    print(f"VIDEO: {video_dir.name}")
    print("=" * 60)

    phone_count = 0

    for frame in sorted(video_dir.glob("*.jpg")):

        results = model(str(frame), verbose=False)

        detected = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                name = result.names[class_id]

                detected.append(f"{name} ({confidence:.2f})")

                if name == "cell phone":
                    phone_count += 1

        print(f"{frame.name}")
        print("Detected:", ", ".join(detected) if detected else "Nothing")

    print(f"\nPhone detected in {phone_count}/10 frames")