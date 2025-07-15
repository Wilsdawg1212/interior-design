from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi import Request
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint import StableDiffusionInpaintPipeline
from PIL import Image, ImageDraw
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

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
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

    output = pipe(prompt=prompt, image=img, mask_image=mask)

    # Handle return formats
    if isinstance(output, tuple):
        result_raw = output[0]
    else:
        result_raw = output.images
    if isinstance(result_raw, list):
        result = result_raw[0]
    elif hasattr(result_raw, 'save'):
        result = result_raw
    elif isinstance(result_raw, torch.Tensor):
        arr = result_raw.cpu().numpy()
        result = Image.fromarray(arr.astype(np.uint8))
    elif isinstance(result_raw, np.ndarray):
        result = Image.fromarray(result_raw.astype(np.uint8))
    else:
        raise TypeError(f"Unexpected output type: {type(result_raw)}")

    # Save result to buffer
    buf = io.BytesIO()
    if isinstance(result, Image.Image):
        result.save(buf, format="PNG")
    else:
        raise TypeError(f"Result is not a PIL Image, got {type(result)}")
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
