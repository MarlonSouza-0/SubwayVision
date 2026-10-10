import ifcopenshell

def carregar_ifc(caminho_ifc: str):
    """Tenta abrir um arquivo IFC. Se não conseguir, retorna None."""
    try:
        return ifcopenshell.open(caminho_ifc)
    except Exception as e:
        print("Erro ao abrir IFC:", e)
        return None


def listar_colunas(ifc_model):
    """Retorna lista de colunas (IfcColumn) de um modelo IFC."""
    if ifc_model is None:
        return []

    cols = ifc_model.by_type("IfcColumn")
    dados = []
    for c in cols:
        dados.append({
            "global_id": c.GlobalId,
            "name": c.Name,
            "type": str(c.ObjectType) if c.ObjectType else None
        })
    return dados


def encontrar_coluna_por_nome(ifc_model, coluna_nome: str):
    """Procura uma IfcColumn cujo Name bate com o parâmetro."""
    if ifc_model is None:
        return None

    cols = ifc_model.by_type("IfcColumn")
    for c in cols:
        if c.Name and c.Name.lower() == coluna_nome.lower():
            return c
    return None
