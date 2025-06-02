from pathlib import Path
from create_random_dataset import create_dataset

root = Path("data")
real_source = root / "celeba/img_align_celeba"
fake_sources = {
    "stable_diffusion_xl": root / "stable_diffusion_xl",
    "stylegan1": root / "stylegan1",
    "stylegan2": root / "stylegan2",
    "stylegan3": root / "stylegan3",
    "thispersondoesnotexist": root / "thispersondoesnotexist",
}

# # Small Random Dataset
# create_dataset(
#     output_base="small_dataset_random",
#     real_source=real_source,
#     fake_sources=fake_sources,
#     fake_per_class=100,
#     real_total=500
# )

# # Medium Random Dataset
# create_dataset(
#     output_base="medium_dataset_random",
#     real_source=real_source,
#     fake_sources=fake_sources,
#     fake_per_class=300,
#     real_total=1500
# )

# Large Random Dataset
create_dataset(
    output_base="large_dataset_random",
    real_source=real_source,
    fake_sources=fake_sources,
    fake_per_class=1000,
    real_total=5000
)