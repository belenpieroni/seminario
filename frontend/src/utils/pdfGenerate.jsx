import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function pdfGenerate({ studentName, belt, examDate, senseiName, hash }) {
  try {
    console.log("📄 Iniciando generación de certificado para:", studentName)

    // 1. Cargar la plantilla PDF desde public/
    const existingPdfBytes = await fetch('/certificado_base.pdf').then(res => res.arrayBuffer())
    console.log("✅ Plantilla PDF cargada")

    // 2. Abrir el PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const page = pdfDoc.getPages()[0]

    // 3. Fuente y color
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const color = rgb(0, 0, 0)

    // 4. Escribir los datos en las coordenadas
    page.drawText(studentName, { x: 330, y: 335, size: 25, font, color })
    page.drawText(belt,        { x: 375, y: 230, size: 25, font, color })
    page.drawText(examDate,    { x: 390, y: 140, size: 18, font, color })
    page.drawText(senseiName,  { x: 140, y: 100, size: 14, font, color })

    // 5. Escribir el hash arriba a la derecha
    const { width, height } = page.getSize()
    const hashText = `Hash: ${hash}`
    const fontSize = 10
    const textWidth = font.widthOfTextAtSize(hashText, fontSize)

    page.drawText(hashText, {
      x: width - textWidth - 20, // margen derecho
      y: height - 30,            // margen superior
      size: fontSize,
      font,
      color,
    })

    // 6. Guardar el nuevo PDF en memoria
    const pdfBytes = await pdfDoc.save()
    console.log("✅ PDF generado en memoria, tamaño:", pdfBytes.length)

    return pdfBytes
  } catch (err) {
    console.error("❌ Error en pdfGenerate:", err)
    throw err
  }
}
