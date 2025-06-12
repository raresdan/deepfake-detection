import numpy as np
import cv2
import torch

import base64
from io import BytesIO
from PIL import Image


def extract_tensor(x):
    # Recursively extract the first tensor from ModelOutput or tuple
    if hasattr(x, 'logits'):
        return extract_tensor(x.logits)
    if isinstance(x, tuple):
        return extract_tensor(x[0])
    return x


def generate_gradcam(model, input_tensor, target_layer, class_idx=None):
    gradients = []
    activations = []

    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])

    def forward_hook(module, input, output):
        activations.append(output)

    fwd_handle = target_layer.register_forward_hook(forward_hook)
    bwd_handle = target_layer.register_full_backward_hook(backward_hook)

    model.eval()
    output = model(input_tensor)
    output = extract_tensor(output)
    if class_idx is None:
        class_idx = output.argmax(dim=1).item()
    class_idx = int(class_idx)

    loss = output[0, class_idx]
    model.zero_grad()
    loss.backward(retain_graph=True)

    grad = gradients[0].detach().cpu().numpy()[0]      # shape: (C, H, W)
    act = activations[0].detach().cpu().numpy()[0]     # shape: (C, H, W)

    # Grad-CAM++ weights calculation
    grad2 = grad ** 2
    grad3 = grad ** 3
    sum_acts = np.sum(act, axis=(1, 2), keepdims=True)  # shape: (C, 1, 1)
    eps = 1e-8

    alpha_num = grad2
    alpha_denom = 2 * grad2 + sum_acts * grad3
    alpha_denom = np.where(alpha_denom != 0.0, alpha_denom, eps)
    alphas = alpha_num / alpha_denom  # shape: (C, H, W)
    weights = np.maximum(grad, 0)
    deep_linearization_weights = np.sum(alphas * weights, axis=(1, 2))  # shape: (C,)

    cam = np.sum(deep_linearization_weights[:, None, None] * act, axis=0)  # shape: (H, W)
    cam = np.maximum(cam, 0)
    cam = cv2.resize(cam, (input_tensor.shape[2], input_tensor.shape[3]))
    cam = cam - np.min(cam)
    cam = cam / (np.max(cam) + 1e-8)

    fwd_handle.remove()
    bwd_handle.remove()
    return cam


def run_deepfake_model(
    img, faces, model=None, class_names=None, return_gradcam=False, gradcam_layer=None, feature_extractor=None
):
    if model is None or not faces:
        return "unknown", []
    box = faces[0]["box"]
    x1, y1, x2, y2 = map(int, box)
    face_img = img[y1:y2, x1:x2]
    face_resized = cv2.resize(face_img, (224, 224))
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)

    # Use feature_extractor if provided (for ViT)
    if feature_extractor is not None:
        # Convert to PIL Image for HuggingFace processors
        pil_img = Image.fromarray(face_rgb)
        inputs = feature_extractor(images=pil_img, return_tensors="pt")
        input_tensor = inputs["pixel_values"]
    else:
        face_norm = face_rgb / 255.0
        face_input = np.transpose(face_norm, (2, 0, 1))[None, ...]
        face_input = np.ascontiguousarray(face_input, dtype=np.float32)
        input_tensor = torch.from_numpy(face_input)

    # Always extract tensor from model output
    with torch.no_grad():
        output = model(input_tensor)
        logits = extract_tensor(output)
        probs = torch.softmax(logits, dim=1).detach().cpu().numpy()[0]

    if class_names is None:
        class_names = [f"class_{i}" for i in range(len(probs))]
    top3_indices = np.argsort(probs)[::-1][:3]
    top3 = [(class_names[i], float(probs[i])) for i in top3_indices]
    main_class = class_names[top3_indices[0]].lower()
    verdict = (
        "real" if "real" in main_class else
        "fake" if "fake" in main_class else
        ("real" if top3_indices[0] == 0 else "fake")
    )

    # Grad-CAM if requested
    if return_gradcam and gradcam_layer is not None:
        input_tensor.requires_grad = True
        cam = generate_gradcam(model, input_tensor, gradcam_layer, class_idx=int(top3_indices[0]))

        cam_uint8 = np.uint8(255 * cam)
        cam_color = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        overlay = 0.5 * cam_color + 0.5 * face_resized
        overlay = np.clip(overlay, 0, 255).astype(np.uint8)

        im = Image.fromarray(overlay)
        buf = BytesIO()
        im.save(buf, format='PNG')
        cam_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return verdict, top3, cam_b64
    return verdict, top3



def load_model(model_path):
    model = torch.load(model_path, map_location='cpu')
    model.eval()
    return model