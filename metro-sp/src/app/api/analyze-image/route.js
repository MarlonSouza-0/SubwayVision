import { NextResponse } from "next/server";
import cv from "opencv4nodejs"; // precisa instalar: npm install opencv4nodejs

export async function POST(req) {
  try {
    // Recebe o corpo da requisição (JSON com a URL da imagem no Firebase Storage)
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "URL da imagem é obrigatória" }, { status: 400 });
    }

    // Faz download da imagem (buffer)
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lê a imagem no OpenCV
    const mat = cv.imdecode(buffer);

    // --- Exemplo de análises simples ---
    // Converte para escala de cinza
    const gray = mat.bgrToGray();

    // Detecta bordas (Canny)
    const edges = gray.canny(50, 150);

    // Conta os contornos
    const contours = edges.findContours(
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    const analysis = {
      width: mat.cols,
      height: mat.rows,
      contoursCount: contours.length,
    };

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error("Erro na análise:", err);
    return NextResponse.json({ error: "Erro ao processar imagem" }, { status: 500 });
  }
}
