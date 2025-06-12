import torch
import os
from transformers import ViTForImageClassification, ViTFeatureExtractor

def load_vit_multiclass():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "..", "models", "VisionTransformer", "final_model")
    feature_dir = os.path.join(base_dir, "..", "models", "VisionTransformer", "feature_extractor")
    model_dir = os.path.abspath(model_dir)
    feature_dir = os.path.abspath(feature_dir)
    model = ViTForImageClassification.from_pretrained(model_dir)
    feature_extractor = ViTFeatureExtractor.from_pretrained(feature_dir)
    model.to("cpu")
    model.eval()
    return model, feature_extractor