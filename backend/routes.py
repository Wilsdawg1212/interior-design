from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import json

from config import CANVAS_WIDTH, CANVAS_HEIGHT
from image_utils import create_mask, apply_gaussian_blur, blend_image_with_mask, remove_background
from ai_model import img2img_pipe, run_inpainting

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/inpaint/")
async def inpaint_image(
    request: Request,
    image: UploadFile = File(...),
    prompt: str = Form(None),  # Make prompt optional
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
    mask = create_mask(mask_size, furniture_list)
    mask = apply_gaussian_blur(mask)
    blended_img = blend_image_with_mask(img, mask)

    # Refine using Img2Img
    result = run_inpainting(img2img_pipe, prompt, blended_img)

    # Save result
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.post("/remove_bg/")
async def remove_bg_endpoint(image: UploadFile = File(...)):
    image_bytes = await image.read()
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    output_image = remove_background(input_image)
    buf = io.BytesIO()
    output_image.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png") 


@app.post("/inpaint_erasure/")
async def inpaint_erasure_endpoint(
    request: Request,
    image: UploadFile = File(...),
    erasure_spots: str = Form(...),
    width: int = Form(None),
    height: int = Form(None)
):
    image_bytes = await image.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    if width and height:
        img = img.resize((width, height), Image.Resampling.LANCZOS)
        mask_size = (width, height)
    else:
        mask_size = img.size

    # Get furniture spots
    furniture_list = json.loads(erasure_spots)
    mask = create_mask(mask_size, furniture_list)
    mask = apply_gaussian_blur(mask)

    # Use the inpainting pipeline for erasure
    from ai_model import run_erasure, load_inpaint_pipeline
    inpaint_pipe = load_inpaint_pipeline()
    result = run_erasure(inpaint_pipe, img, mask)
    
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png") 