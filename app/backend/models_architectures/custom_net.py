import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class SEBlock(nn.Module):
    def __init__(self, channels=3, reduction=16):
        super().__init__()
        self.fc1 = nn.Linear(channels, channels // reduction)
        self.fc2 = nn.Linear(channels // reduction, channels)
    def forward(self, x):
        w = x.mean(dim=(2,3))
        w = F.relu(self.fc1(w))
        w = torch.sigmoid(self.fc2(w)).unsqueeze(-1).unsqueeze(-1)
        return x * w

class DeepfakeNet(nn.Module):
    def __init__(self, in_channels=4, num_classes=5):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, 32, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.se1 = SEBlock(32)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.se2 = SEBlock(64)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.attention_head = nn.Conv2d(128, 1, 1)
        self.fc1 = nn.Linear(128 * 28 * 28, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.pool(F.relu(self.se1(self.bn1(self.conv1(x)))))
        x = self.pool(F.relu(self.se2(self.bn2(self.conv2(x)))))
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        attn_map = torch.sigmoid(self.attention_head(x))
        x_flat = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x_flat))
        logits = self.fc2(x)
        return logits, attn_map



def load_custom_multiclass():
    model = DeepfakeNet()
    model.load_state_dict(torch.load("models/custom_multiclass.pth", map_location="cpu"))
    model.eval()
    return model