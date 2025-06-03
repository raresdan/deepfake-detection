import numpy as np
import cv2
import torch

def run_deepfake_model(img, faces, model=None, class_names=None):
    """
    img: np.ndarray (BGR, as from OpenCV)
    faces: list of dicts with 'box' key (e.g. [ {"box": [x1, y1, x2, y2]}, ... ])
    model: your loaded model (pass it in from your app)
    class_names: optional list of class names, e.g. ['real', 'fake', 'stylegan2', ...]
    Returns: verdict ('real' or 'fake'), top3 predictions as list of (class_name, confidence)
    """
    if model is None or not faces:
        return "unknown", []

    box = faces[0]["box"]
    x1, y1, x2, y2 = map(int, box)
    face_img = img[y1:y2, x1:x2]

    face_resized = cv2.resize(face_img, (224, 224))
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
    face_norm = face_rgb / 255.0
    face_input = np.transpose(face_norm, (2, 0, 1))[None, ...]
    face_input = np.ascontiguousarray(face_input, dtype=np.float32)

    with torch.no_grad():
        input_tensor = torch.from_numpy(face_input)
        logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

        # Default class names if not provided
        if class_names is None:
            class_names = [f"class_{i}" for i in range(len(probs))]

        # Get top 3 predictions and their confidences
        top3_indices = np.argsort(probs)[::-1][:3]
        top3 = [(class_names[i], float(probs[i])) for i in top3_indices]

        # Verdict: if highest prob class is 'real' (0), else 'fake'
        # If your class_names are different, update this logic as needed!
        main_class = class_names[top3_indices[0]].lower()
        if "real" in main_class:
            verdict = "real"
        elif "fake" in main_class:
            verdict = "fake"
        else:
            # If neither, default: 0 = real, 1 = fake (if only binary)
            verdict = "real" if top3_indices[0] == 0 else "fake"

    return verdict, top3


def load_model(model_path):
    model = torch.load(model_path, map_location='cpu')
    model.eval()
    return model