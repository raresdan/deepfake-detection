import torchvision.datasets as datasets
import torchvision.transforms as transforms
from pathlib import Path


# Define the root directory for the dataset
data_root = Path("./data")  # Change this path if needed

# Define transformations (optional)
transform = transforms.Compose([
    transforms.ToTensor()
])

# Download the dataset
celeba_dataset = datasets.CelebA(
    root=data_root,
    split='all',  # You can change this to 'train', 'valid', or 'test'
    target_type='attr',  # You can change this to 'identity', 'bbox', 'landmarks', or a list of these
    transform=transform,
    download=True
)

print("CelebA dataset downloaded successfully!")
