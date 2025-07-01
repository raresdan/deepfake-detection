import torch
import timm
import torch.nn as nn

class EfficientNetB1Custom(nn.Module):
  ### Porcile Paper Approach
    def __init__(self, dropout=0.2):
        super().__init__()
        self.backbone = timm.create_model('efficientnet_b1', pretrained=True)
        in_features = self.backbone.classifier.in_features
        self.backbone.classifier = nn.Identity()
        self.head = nn.Sequential(
            nn.Linear(in_features, 2048),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(2048, 2048),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(2048, 6)
        )
    def forward(self, x):
        feats = self.backbone(x)
        out = self.head(feats)
        return out


def load_efficientnet_multiclass():
    model = EfficientNetB1Custom(dropout=0.2)
    model.load_state_dict(torch.load("models/efficientnet_multiclass.pth", map_location="cpu"))
    model.eval()
    return model