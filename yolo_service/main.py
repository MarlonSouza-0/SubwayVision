import os
import uuid

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .detection import detectar_coluna_imagem
from .ifc_utils import carregar_ifc, listar_colunas, encontrar_coluna_por_nome

# ============================================================
# Configuração básica do FastAPI
# ============================================================

app = FastAPI()

# CORS para permitir o front em localhost:3000
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Diretórios
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "yolo_service", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Servir arquivos estáticos de imagem em /uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "YOLO / IFC service ativo."}


# ============================================================
# 1) Endpoint simples: só imagem -> verifica se tem coluna
# ============================================================

@app.post("/analisar-coluna")
async def analisar_coluna(
    imagem: UploadFile = File(...),
    coluna_id: str = Form(None),
    local: str = Form(None),
):
    """
    Recebe apenas uma imagem, roda YOLO e gera um mini-relatório
    dizendo se identificou ou não coluna.
    """

    # Salvar imagem localmente
    img_id = str(uuid.uuid4())
    img_name = f"{img_id}_{imagem.filename}"
    img_path = os.path.join(UPLOAD_DIR, img_name)
    contents = await imagem.read()
    with open(img_path, "wb") as f:
        f.write(contents)

    # URL pública da imagem servida pelo FastAPI
    image_url = f"http://127.0.0.1:8000/uploads/{img_name}"

    # Rodar YOLO
    encontrou_coluna, colunas_detectadas = detectar_coluna_imagem(img_path)

    if encontrou_coluna:
        status = "OK"
        mensagem = "Coluna identificada na imagem."
    else:
        status = "ALERTA"
        mensagem = (
            "A coluna esperada NÃO foi identificada automaticamente na imagem. "
            "Pode indicar ausência do elemento, obstrução ou problema de enquadramento. "
            "Recomenda-se inspeção presencial ou nova captura de imagem."
        )

    relatorio = {
        "status": status,
        "mensagem": mensagem,
        "coluna_id_esperada": coluna_id,
        "local": local,
        "detalhes_detecao_imagem": colunas_detectadas,
        "caminho_arquivo_imagem": img_path,
        "image_url": image_url,
    }

    return JSONResponse(content=relatorio)


# ============================================================
# 2) Endpoint imagem + IFC -> comparação + relatório
#    com regra especial para `coluna1.ifc`
# ============================================================

@app.post("/analisar-coluna-ifc")
async def analisar_coluna_com_ifc(
    imagem: UploadFile = File(...),
    ifc_file: UploadFile = File(...),
    coluna_id: str = Form(None),
    local: str = Form(None),
):
    """
    Recebe uma imagem e um arquivo IFC (falso ou real),
    roda YOLO e compara com o IFC para gerar um relatório.

    - Se o arquivo se chamar 'coluna1.ifc', força status OK (dentro do cronograma),
      mesmo que o IFC esteja vazio.
    """

    # 1) Salvar imagem
    img_id = str(uuid.uuid4())
    img_name = f"{img_id}_{imagem.filename}"
    img_path = os.path.join(UPLOAD_DIR, img_name)
    img_contents = await imagem.read()
    with open(img_path, "wb") as f:
        f.write(img_contents)

    # URL pública da imagem
    image_url = f"http://127.0.0.1:8000/uploads/{img_name}"

    # 2) Salvar IFC
    ifc_id = str(uuid.uuid4())
    ifc_name = f"{ifc_id}_{ifc_file.filename}"
    ifc_path = os.path.join(UPLOAD_DIR, ifc_name)
    ifc_contents = await ifc_file.read()
    with open(ifc_path, "wb") as f:
        f.write(ifc_contents)

    # =====================================================
    # REGRA ESPECIAL: arquivo chamado exatamente coluna1.ifc
    # =====================================================
    if ifc_file.filename.lower() == "coluna1.ifc":
        relatorio_especial = {
            "status": "OK",
            "mensagem": (
                "Coluna prevista no cronograma. Este arquivo IFC especial indica "
                "que a etapa está dentro dos prazos definidos, sem necessidade de "
                "comparação geométrica."
            ),
            "coluna_id_esperada": coluna_id,
            "local": local,
            "ifc": {
                "valido": True,
                "arquivo": ifc_file.filename,
                "modo": "arquivo especial de cronograma",
                "explicacao": (
                    "Este IFC especial representa que a etapa está prevista e aceita, "
                    "sendo usado apenas como marcador de cronograma."
                ),
            },
            "detalhes_detecao_imagem": [],
            "caminho_arquivo_imagem": img_path,
            "image_url": image_url,
            "caminho_arquivo_ifc": ifc_path,
        }
        return JSONResponse(content=relatorio_especial)

    # 3) Rodar YOLO normalmente
    encontrou_coluna, colunas_detectadas = detectar_coluna_imagem(img_path)

    # 4) Carregar IFC enviado
    ifc_model = carregar_ifc(ifc_path)

    if ifc_model is None:
        # arquivo não era IFC válido
        status = "IFC_INVALIDO"
        mensagem = (
            "O arquivo enviado como IFC não pôde ser lido. "
            "Verifique se o formato está correto."
        )

        relatorio = {
            "status": status,
            "mensagem": mensagem,
            "coluna_id_esperada": coluna_id,
            "local": local,
            "ifc": {
                "valido": False,
                "total_colunas_ifc": 0,
                "coluna_encontrada_no_ifc": False,
            },
            "detalhes_detecao_imagem": colunas_detectadas,
            "caminho_arquivo_imagem": img_path,
            "image_url": image_url,
            "caminho_arquivo_ifc": ifc_path,
        }
        return JSONResponse(content=relatorio)

    # 5) IFC válido: listar colunas e procurar a coluna_id (se enviada)
    colunas_ifc = listar_colunas(ifc_model)
    total_colunas_ifc = len(colunas_ifc)

    coluna_ifc = None
    coluna_ifc_existe = False

    if coluna_id:
        coluna_ifc = encontrar_coluna_por_nome(ifc_model, coluna_id)
        coluna_ifc_existe = coluna_ifc is not None

    # 6) Lógica de comparação IFC x IMAGEM
    if coluna_ifc_existe and encontrou_coluna:
        status = "OK"
        mensagem = (
            "A coluna esperada existe no IFC enviado e foi identificada na imagem. "
            "Projeto e imagem estão coerentes para esse ponto analisado."
        )

    elif coluna_ifc_existe and not encontrou_coluna:
        status = "ALERTA_IFC_SEM_IMAGEM"
        mensagem = (
            "A coluna esperada está presente no IFC enviado, "
            "mas NÃO foi identificada na imagem. "
            "Pode indicar elemento ainda não executado, obstrução "
            "ou problema na captura da foto."
        )

    elif not coluna_ifc_existe and encontrou_coluna:
        status = "ALERTA_IMAGEM_SEM_IFC"
        mensagem = (
            "Uma coluna foi identificada na imagem, mas o IFC enviado "
            "não possui uma coluna com o identificador informado. "
            "Pode indicar execução fora do modelo ou inconsistência de dados."
        )

    else:
        status = "SEM_COLUNA"
        mensagem = (
            "Nenhuma coluna foi identificada na imagem e não há coluna correspondente "
            "no IFC para o identificador informado."
        )

    # 7) Montar relatório completo
    relatorio = {
        "status": status,
        "mensagem": mensagem,
        "coluna_id_esperada": coluna_id,
        "local": local,
        "ifc": {
            "valido": True,
            "total_colunas_ifc": total_colunas_ifc,
            "coluna_encontrada_no_ifc": coluna_ifc_existe,
            "coluna_ifc": {
                "global_id": getattr(coluna_ifc, "GlobalId", None) if coluna_ifc_existe else None,
                "name": getattr(coluna_ifc, "Name", None) if coluna_ifc_existe else None,
            },
        },
        "detalhes_detecao_imagem": colunas_detectadas,
        "caminho_arquivo_imagem": img_path,
        "image_url": image_url,
        "caminho_arquivo_ifc": ifc_path,
    }

    return JSONResponse(content=relatorio)
