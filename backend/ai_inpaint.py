from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint import StableDiffusionInpaintPipeline
from PIL import Image
import torch
import torchvision.transforms as T
import numpy as np
import io

app = FastAPI()

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

@app.post("/inpaint/")
async def inpaint_image(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form(...)
):
    image_bytes = await image.read()
    mask_bytes = await mask.read()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    msk = Image.open(io.BytesIO(mask_bytes)).convert("RGB").resize(img.size)

    output = pipe(prompt=prompt, image=img, mask_image=msk)

    # Determine what kind of result we got
    if isinstance(output, tuple):
        result_raw = output[0]  # Tensor or ndarray
    else:
        result_raw = output.images  # Should be list of PIL Images

    # Convert to PIL.Image if needed
    if isinstance(result_raw, list):
        result = result_raw[0]
    elif isinstance(result_raw, torch.Tensor):
        result = T.ToPILImage()(result_raw.squeeze())
    elif isinstance(result_raw, np.ndarray):
        result = Image.fromarray(result_raw.astype(np.uint8))
    else:
        raise TypeError(f"Unexpected output type: {type(result_raw)}")

    # Save result to buffer
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
