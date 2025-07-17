import torch
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint import StableDiffusionInpaintPipeline
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_img2img import StableDiffusionImg2ImgPipeline
from PIL import Image
import io

from config import MODEL_NAME, TORCH_DTYPE, DEVICE, IMG2IMG_STRENGTH, GUIDANCE_SCALE, DEFAULT_PROMPT

def load_img2img_pipeline():
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        MODEL_NAME,
        torch_dtype=TORCH_DTYPE
    )
    pipe.to(DEVICE)
    return pipe

pipe = load_img2img_pipeline()

def run_inpainting(pipe, prompt, blended_img):
    result = pipe(
        prompt=prompt or DEFAULT_PROMPT,
        image=blended_img,
        strength=IMG2IMG_STRENGTH,
        guidance_scale=GUIDANCE_SCALE
    )
    # Some versions return a tuple, some return a pipeline output object
    if hasattr(result, 'images'):
        return result.images[0]
    elif isinstance(result, tuple):
        return result[0]
    else:
        raise RuntimeError('Unknown pipeline output format') 