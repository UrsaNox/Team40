import cv2
import mediapipe as mp
import numpy as np
from collections import deque

# 🔧 SETTINGS
SEQUENCE_LENGTH = 30

# ✅ Sliding window buffer
sequence = deque(maxlen=SEQUENCE_LENGTH)

# 🔥 Reduced face landmarks (important points only)
# Nose tip, chin, left eye, right eye, left mouth, right mouth
FACE_INDICES = [1, 152, 33, 263, 61, 291]

# MediaPipe setup
mp_holistic = mp.solutions.holistic

holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)

recording = False


# 🔥 Keypoint extraction
def extract_keypoints(results):

    # Pose (33 points)
    pose = np.array(
        [(lm.x, lm.y, lm.z) for lm in results.pose_landmarks.landmark]
    ).flatten() if results.pose_landmarks else np.zeros(33 * 3)

    # Left hand (21 points)
    lh = np.array(
        [(lm.x, lm.y, lm.z) for lm in results.left_hand_landmarks.landmark]
    ).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)

    # Right hand (21 points)
    rh = np.array(
        [(lm.x, lm.y, lm.z) for lm in results.right_hand_landmarks.landmark]
    ).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)

    # 🔥 Reduced face mesh
    if results.face_landmarks:
        face = np.array([
            (results.face_landmarks.landmark[i].x,
             results.face_landmarks.landmark[i].y,
             results.face_landmarks.landmark[i].z)
            for i in FACE_INDICES
        ]).flatten()
    else:
        face = np.zeros(len(FACE_INDICES) * 3)

    # Final feature vector
    return np.concatenate([pose, lh, rh, face])


# 🎥 MAIN LOOP
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

        if recording:
            print("Started capturing...")

        else:
            print(f"Stopped. Captured {len(sequence)} frames")

            # 🔍 BUFFER INSPECTION
            if len(sequence) > 0:
                buffer_array = np.array(sequence)

                print("\n=== BUFFER INSPECTION ===")
                print("Buffer length:", len(sequence))
                print("Buffer shape:", buffer_array.shape)

                # Last 5 frames
                print("\nLast 5 frames:")
                print(buffer_array[-5:])

                # First frame sample
                print("\nFirst frame (first 10 values):")
                print(buffer_array[0][:10])

                # Last frame sample
                print("\nLast frame (first 10 values):")
                print(buffer_array[-1][:10])

                print("\nNon-zero values (last frame):", np.count_nonzero(buffer_array[-1]))

            # Reset AFTER inspection
            sequence.clear()

    # 🔴 Continuous capture (sliding window)
    if recording:
        keypoints = extract_keypoints(results)

        sequence.append(keypoints)

        if len(sequence) == SEQUENCE_LENGTH:
            print("Sequence Ready:", np.array(sequence).shape)

    cv2.imshow("Camera Feed", frame)

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()