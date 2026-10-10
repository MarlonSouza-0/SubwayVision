from fastapi import FastAPI
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
import requests
from pathlib import Path

# ======== Fix PyTorch >= 2.6 weights_only ========
import torch
import torch.serialization
import inspect, pkgutil, importlib
import torch.nn as tnn
import ultralytics.nn as ynn

def allow_all_classes_from_package(pkg):
    for _, obj in inspect.getmembers(pkg, inspect.isclass):
        try:
            torch.serialization.add_safe_globals([obj])
        except Exception:
            pass
    if hasattr(pkg, "__path__"):
        prefix = pkg.__name__ + "."
        for _, modname, _ in pkgutil.walk_packages(pkg.__path__, prefix):
            try:
                m = importlib.import_module(modname)
            except Exception:
                continue
            for _, obj in inspect.getmembers(m, inspect.isclass):
                try:
                    torch.serialization.add_safe_globals([obj])
                except Exception:
                    pass

allow_all_classes_from_package(tnn)
allow_all_classes_from_package(ynn)

try:
    from ultralytics.nn.tasks import DetectionModel, ClassificationModel, SegmentationModel
    torch.serialization.add_safe_globals([DetectionModel, ClassificationModel, SegmentationModel])
except Exception:
    pass
# ================================================

from ultralytics import YOLO

app = FastAPI()

# 🚀 ROTA RAIZ
@app.get("/")
async def root():
    return {"status": "YOLO Service is running ✅"}

# ======== 🔥 Caminho do modelo treinado ========
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "columns-best.pt"

# Carrega modelo customizado
model = YOLO(str(MODEL_PATH))

class ImageRequest(BaseModel):
    imageUrl: str

@app.post("/analyze-image")
async def analyze_image(data: ImageRequest):
    try:
        resp = requests.get(data.imageUrl, timeout=20)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content)).convert("RGB")

        results = model(img)
        detections = []

        for r in results:
            names = getattr(model, "names", {})
            for box in r.boxes:
                cls_idx = int(box.cls[0])
                detections.append({
                    "class": names.get(cls_idx, str(cls_idx)),
                    "confidence": float(box.conf[0]),
                    "bbox": [float(x) for x in box.xyxy[0].tolist()],
                })

        return {"success": True, "detections": detections}

    except Exception as e:
        return {"success": False, "error": str(e)}
