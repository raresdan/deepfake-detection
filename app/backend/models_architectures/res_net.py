import torch
import timm
import torch.nn as nn


class ResNetCustom(nn.Module):
    def __init__(self, dropout=0.2, model_name='resnet50'):
        super().__init__()
        self.backbone = timm.create_model(model_name, pretrained=True)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
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
        return out.squeeze(1)


def load_resnet_multiclass():
    model = ResNetCustom(dropout=0.2)
    model.load_state_dict(torch.load("models/resnet_multiclass.pth", map_location="cpu"))
    model.eval()
    return model