import cv2
import mediapipe as mp
import numpy as np

from collections import deque

SEQUENCE_LENGTH = 30  # can be 20–40
sequence = deque(maxlen=SEQUENCE_LENGTH)
mp_holistic = mp.solutions.holistic

holistic = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)

recording = False
sequence = []   # stores frames

def extract_keypoints(results):
    import numpy as np

    pose = np.array([(lm.x, lm.y, lm.z) for lm in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*3)
    
    lh = np.array([(lm.x, lm.y, lm.z) for lm in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    
    rh = np.array([(lm.x, lm.y, lm.z) for lm in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    
    face = np.array([(lm.x, lm.y, lm.z) for lm in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)

    return np.concatenate([pose, lh, rh, face])

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image)

    key = cv2.waitKey(1) & 0xFF

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

                # Non-zero check
                print("\nNon-zero values (last frame):", np.count_nonzero(buffer_array[-1]))

            # Reset buffer AFTER inspection
            sequence.clear()

    # 🔴 Continuous capture (sliding window)
    if recording:
        keypoints = extract_keypoints(results)

        # Always append (keeps sequence consistent)
        sequence.append(keypoints)

        # When buffer is full
        if len(sequence) == SEQUENCE_LENGTH:
            print("Sequence Ready:", np.array(sequence).shape)

    cv2.imshow("Camera Feed", frame)

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()