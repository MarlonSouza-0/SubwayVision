import os
from ultralytics import YOLO

# Caminho absoluto para garantir que o modelo certo seja carregado
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "yolo_service", "models", "columns-best.pt")

print("🔍 Carregando modelo YOLO a partir de:", MODEL_PATH)

# Carrega o modelo treinado
model = YOLO(MODEL_PATH)

print("🔎 Classes disponíveis no modelo:", model.names)


def detectar_coluna_imagem(image_path: str, conf_threshold: float = 0.5):
    """
    Executa o YOLO na imagem e retorna:
      - encontrou_coluna (bool)
      - lista de colunas detectadas (conf, bbox, label)
    """
    results = model(image_path)
    detections = results[0]

    encontrou_coluna = False
    colunas = []

    for box in detections.boxes:
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        label = model.names[cls_id]

        # confirme que sua classe é 'coluna' ou 'column'
        if label.lower() in ["coluna", "column", "columns", "pillar"] and conf >= conf_threshold:
            encontrou_coluna = True
            colunas.append({
                "label": label,
                "conf": conf,
                "bbox": box.xyxy[0].tolist()
            })

    return encontrou_coluna, colunas
