from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from rembg import remove

from config import GAUSSIAN_BLUR_RADIUS

def create_mask(image_size, spot_list):
    mask = Image.new('L', image_size, 0)  # Black background
    draw = ImageDraw.Draw(mask)
    for spot in spot_list:
        x, y = spot['x'], spot['y']
        w, h = spot['width'], spot['height']
        draw.rectangle([x, y, x + w, y + h], fill=255)
    return mask

def apply_gaussian_blur(mask):
    return mask.filter(ImageFilter.GaussianBlur(radius=GAUSSIAN_BLUR_RADIUS))

def blend_image_with_mask(img, mask):
    img_np = np.array(img).astype(np.uint8)
    mask_np = np.array(mask).astype(np.float32) / 255.0
    blended = (img_np * mask_np[..., None] + img_np * (1 - mask_np[..., None])).astype(np.uint8)
    return Image.fromarray(blended)

def remove_background(input_image):
    return remove(input_image) 


