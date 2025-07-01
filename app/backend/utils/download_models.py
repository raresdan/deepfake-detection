import os
import gdown
import zipfile

def download_and_extract_models():
    zip_path = "models.zip"
    file_id = "1Pb67JoSeFVqVOFEXDWwZzpZZ44nOLakK/view?usp=drive_link"  

    if not os.path.exists(zip_path):
        url = f"https://drive.google.com/file/d/{file_id}"
        print("Downloading models.zip...")
        gdown.download(
            "https://drive.google.com/file/d/1Pb67JoSeFVqVOFEXDWwZzpZZ44nOLakK/view?usp=sharing",
            "models.zip",
            quiet=False,
            fuzzy=True
    )


        print("Extracting models.zip...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(".")

        print("Cleaning up zip file...")
        os.remove(zip_path)
    else:
        print("models.zip already downloaded, skipping download.")
        

download_and_extract_models()