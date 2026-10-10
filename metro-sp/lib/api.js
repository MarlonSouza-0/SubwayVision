export async function enviarParaAnaliseIFC(formData) {
  try {
    const response = await fetch("http://localhost:8000/analisar-coluna-ifc", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;

  } catch (err) {
    console.error("Erro na requisição:", err);
    return { error: true };
  }
}
