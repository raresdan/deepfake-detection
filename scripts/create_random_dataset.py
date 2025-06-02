import random
import shutil
from pathlib import Path

random.seed(42)

def create_dataset(output_base, real_source, fake_sources, fake_per_class, real_total):
    output_base = Path(output_base)
    output_base.mkdir(parents=True, exist_ok=True)

    real_dest = output_base / "real"
    real_dest.mkdir(parents=True, exist_ok=True)

    # Select and copy real images
    real_images = list(Path(real_source).glob("*.jpg"))
    selected_real = random.sample(real_images, real_total)
    for i, path in enumerate(selected_real):
        shutil.copy(path, real_dest / f"real_{i:04d}.jpg")

    # Select and copy fake images
    for class_name, class_path in fake_sources.items():
        fake_dest = output_base / class_name
        fake_dest.mkdir(parents=True, exist_ok=True)
        fake_images = list(Path(class_path).glob("*.png")) + list(Path(class_path).glob("*.jpg"))
        if fake_per_class > len(fake_images):
            print(f"Warning: Only {len(fake_images)} fake images available for '{class_name}', using all of them.")
            selected_fake = fake_images
        else:
            selected_fake = random.sample(fake_images, fake_per_class)
        for i, path in enumerate(selected_fake):
            shutil.copy(path, fake_dest / f"{class_name}_{i:04d}.jpg")


    print(f"Created dataset at '{output_base}' with {fake_per_class} fakes/class and {real_total} real images.")
