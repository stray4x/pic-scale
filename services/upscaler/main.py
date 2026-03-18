import io
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from PIL import Image
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet

app = FastAPI()


def load_model(scale: int) -> RealESRGANer:
    if scale == 4:
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4,
        )
        model_path = "weights/RealESRGAN_x4plus.pth"
    elif scale == 2:
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=2,
        )
        model_path = "weights/RealESRGAN_x2plus.pth"
    else:
        raise ValueError(f"Unsupported scale: {scale}")

    return RealESRGANer(
        scale=scale,
        model_path=model_path,
        model=model,
        tile=512,
        tile_pad=10,
        pre_pad=0,
        half=False,
    )


models = {}


@app.on_event("startup")
def startup():
    models[2] = load_model(2)
    models[4] = load_model(4)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upscale")
async def upscale(
    file: UploadFile = File(...),
    scale: int = 4,
):
    if scale not in models:
        raise HTTPException(
            status_code=400, detail=f"Scale {scale} not supported. Use 2 or 4."
        )

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_array = np.array(image)

    output, _ = models[scale].enhance(img_array, outscale=scale)

    output_image = Image.fromarray(output)
    buffer = io.BytesIO()
    output_image.save(buffer, format="PNG")
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="image/png",
    )
