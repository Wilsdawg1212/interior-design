from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi import Request
from diffusers.pipelines.controlnet.pipeline_controlnet import StableDiffusionControlNetPipeline
from diffusers.models.controlnets.controlnet import ControlNetModel
from PIL import Image
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

# Load control image (e.g., Canny edges of your composite image)
controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-canny")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", controlnet=controlnet
).to("cuda" if torch.cuda.is_available() else "cpu")

from controlnet_aux import CannyDetector
canny = CannyDetector()

CANVAS_WIDTH = 800  # Must match frontend
CANVAS_HEIGHT = 384

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

    # Parse furniture JSON (not used for mask, but may be used for future logic)
    # furniture_list = json.loads(furniture)

    # Generate Canny edge map from the composite image
    control_image = canny(img)

    # Run ControlNet pipeline
    result = pipe(
        prompt=prompt or "realistic furniture, natural lighting",
        image=img,
        control_image=control_image,
        guidance_scale=7.5,
        num_inference_steps=4,
        guess_mode=False
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
