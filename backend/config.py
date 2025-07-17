# Configuration settings for the backend
import torch

# Canvas dimensions (must match frontend)
CANVAS_WIDTH = 800
CANVAS_HEIGHT = 384

# AI Model settings
MODEL_NAME = "runwayml/stable-diffusion-v1-5"
TORCH_DTYPE = torch.float16 if torch.cuda.is_available() else torch.float32
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Image processing settings
GAUSSIAN_BLUR_RADIUS = 8
IMG2IMG_STRENGTH = 0.15  # gentle refinement
GUIDANCE_SCALE = 6.5

# Default prompt for image generation
DEFAULT_PROMPT = (
    "same layout, modern furniture with photorealistic textures, consistent lighting, "
    "volumetric shadows, 4k detail, realistic"
) 