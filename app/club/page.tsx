'use client'

import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// ⚠️ GARDE TON CODE EXISTANT AU-DESSUS (rien à modifier)

// 👇 AJOUTE ÇA À LA FIN DE TON COMPONENT

export default function ClubPage() {
  const pdfRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!pdfRef.current) return

    const canvas = await html2canvas(pdfRef.current)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save('rapport-club-A4P.pdf')
  }

  return (
    <main style={{ padding: 20 }}>

      {/* 🔥 BOUTON EXPORT */}
      <button
        onClick={generatePDF}
        style={{
          marginBottom: 20,
          padding: '14px 20px',
          background: '#35528f',
          color: 'white',
          borderRadius: 12,
          fontWeight: 700
        }}
      >
        📄 Export PDF Club
      </button>

      {/* 🔥 ZONE CAPTURÉE */}
      <div ref={pdfRef}>

        {/* 👉 GARDE ICI TOUT TON CONTENU ACTUEL */}
        {/* NE MODIFIE RIEN DE TON DASHBOARD */}

      </div>
    </main>
  )
}
