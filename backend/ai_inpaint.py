from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi import Request
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint import StableDiffusionInpaintPipeline
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_img2img import StableDiffusionImg2ImgPipeline
from PIL import Image, ImageDraw, ImageFilter
import torch
import io
import json
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

CANVAS_WIDTH = 800  # Must match frontend
CANVAS_HEIGHT = 384

def create_furniture_mask(image_size, furniture_list):
    mask = Image.new('L', image_size, 0)  # Black background
    draw = ImageDraw.Draw(mask)
    for furniture in furniture_list:
        x, y = furniture['x'], furniture['y']
        w, h = furniture['width'], furniture['height']
        draw.rectangle([x, y, x + w, y + h], fill=255)
    return mask

@app.post("/inpaint/")
async def inpaint_image(
    request: Request,
    image: UploadFile = File(...),
    prompt: str = Form(...),
    furniture: str = Form(...),  # JSON string
    width: int = Form(None),
    height: int = Form(None),
):
    image_bytes = await image.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Resize to match frontend canvas if width/height provided
    if width and height:
        img = img.resize((width, height), Image.Resampling.LANCZOS)
        mask_size = (width, height)
    else:
        mask_size = img.size

    # Parse furniture JSON
    furniture_list = json.loads(furniture)
    mask = create_furniture_mask(mask_size, furniture_list)

    mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

        # Composite furniture mask over original (if needed)
    img_np = np.array(img).astype(np.uint8)
    mask_np = np.array(mask).astype(np.float32) / 255.0
    blended = (img_np * mask_np[..., None] + img_np * (1 - mask_np[..., None])).astype(np.uint8)
    blended_img = Image.fromarray(blended)

        # Refine using Img2Img
    result = pipe(
        prompt="photorealistic object blended into scene, realistic lighting, soft shadows",
        image=blended_img,
        strength=0.15,  # Low = gentle refinement
        guidance_scale=6.5
    ).images[0]

    # Save result
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@app.post("/remove_bg/")
async def remove_bg_endpoint(image: UploadFile = File(...)):
    image_bytes = await image.read()
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    output_image = remove(input_image)
    buf = io.BytesIO()
    output_image.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
