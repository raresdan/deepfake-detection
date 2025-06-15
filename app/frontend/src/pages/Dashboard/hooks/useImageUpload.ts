import { useState } from "react";
import axios from "axios";


export function useImageUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [faceValid, setFaceValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImage(file ?? null);
    setImagePreview(null);
    setFaceValid(null);
    setError(null);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
      try {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await axios.post(
          "/api/validate-face",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setFaceValid(data.valid);
        if (!data.valid) setError("No face detected in the uploaded image.");
      } catch {
        setFaceValid(false);
        setError("Failed to validate face in the image.");
      }
    }
  };

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setFaceValid(null);
    setError(null);
  };

  return {
    image,
    setImage,
    imagePreview,
    faceValid,
    error,
    handleImageChange,
    handleClear,
    setError,
  };
}
