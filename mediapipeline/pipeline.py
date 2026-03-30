import cv2
import mediapipe as mp
import numpy as np

mp_holistic = mp.solutions.holistic

holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)

recording = False
sequence = []   # stores frames

def extract_keypoints(results):
    pose = [(lm.x, lm.y, lm.z) for lm in results.pose_landmarks.landmark] if results.pose_landmarks else []
    lh = [(lm.x, lm.y, lm.z) for lm in results.left_hand_landmarks.landmark] if results.left_hand_landmarks else []
    rh = [(lm.x, lm.y, lm.z) for lm in results.right_hand_landmarks.landmark] if results.right_hand_landmarks else []
    face = [(lm.x, lm.y, lm.z) for lm in results.face_landmarks.landmark] if results.face_landmarks else []

    return {
        "pose": pose,
        "left_hand": lh,
        "right_hand": rh,
        "face": face
    }

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image)

    key = cv2.waitKey(1) & 0xFF

    # 🔁 Toggle recording
    if key == ord('t'):
        recording = not recording
        print("Recording:", recording)

        # 👉 ADD THIS BLOCK HERE
        keypoints = extract_keypoints(results)

        print("\n=== CHECK ===")
        print("Pose:", len(keypoints['pose']))
        print("Left Hand:", len(keypoints['left_hand']))
        print("Right Hand:", len(keypoints['right_hand']))
        print("Face:", len(keypoints['face']))

    if not recording:
        print(f"Captured {len(sequence)} frames")
        sequence = []
    # 🔴 If recording → keep extracting every frame
    if recording:
        keypoints = extract_keypoints(results)
        sequence.append(keypoints)

    cv2.imshow("Camera Feed", frame)

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()