
import { jsPDF } from "jspdf";
import { Proposal, BusinessProfile } from "../types";
import { formatDate } from "./date";

export const generateContractPDF = (proposal: Proposal, profile: BusinessProfile) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Helper to add text and increment y
  const addText = (text: string, fontSize: number = 12, font: string = "helvetica", align: "left" | "center" | "right" | "justify" = "left", isBold: boolean = false) => {
    doc.setFont(font, isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    
    if (align === "justify") {
         const textLines = doc.splitTextToSize(text, 170);
         doc.text(textLines, margin, y);
         y += (textLines.length * (fontSize / 2)) + 5;
    } else if (align === "center") {
        doc.text(text, 105, y, { align: "center" });
        y += fontSize + 2;
    } else {
        doc.text(text, margin, y);
        y += fontSize + 2;
    }
  };

  // Header
  if (profile.logoUrl) {
      try {
          // Check if base64
          if (profile.logoUrl.startsWith('data:image')) {
             const imgProps = doc.getImageProperties(profile.logoUrl);
             const width = 30;
             const height = (imgProps.height * width) / imgProps.width;
             doc.addImage(profile.logoUrl, 'JPEG', 105 - (width/2), y, width, height);
             y += height + 10;
          }
      } catch (e) {
          console.error("Error adding logo to PDF", e);
      }
  }
  
  addText(profile.name.toUpperCase(), 16, "helvetica", "center", true);
  addText(`CNPJ/CPF: ${profile.pixKey}`, 10, "helvetica", "center");
  y += 10;

  addText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", 14, "helvetica", "center", true);
  y += 10;

  // Body
  const bodyText = `
  Pelo presente instrumento particular, de um lado ${profile.name}, doravante denominado CONTRATADO, e de outro lado ${proposal.clientName}, doravante denominado CONTRATANTE, têm entre si justo e contratado o seguinte:

  1. OBJETO
  O presente contrato tem por objeto a prestação de serviços de ${proposal.eventName} a ser realizado no dia ${formatDate(proposal.date)}.

  2. VALOR
  Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO a importância de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.amount)}.

  3. TERMOS GERAIS
  ${profile.contractTerms || 'O CONTRATADO compromete-se a prestar os serviços com zelo e qualidade técnica. O cancelamento por parte do CONTRATANTE deve ser comunicado com antecedência mínima de 30 dias.'}
  `;

  const splitBody = doc.splitTextToSize(bodyText, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(splitBody, margin, y);
  
  y += (splitBody.length * 6) + 20;

  // Signatures
  if (y > 240) {
      doc.addPage();
      y = 40;
  }

  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  addText(`São Paulo, ${today}`, 11, "helvetica", "center");
  
  y += 30;

  // Lines
  doc.line(margin, y, 90, y); // Left line
  doc.line(120, y, 190, y); // Right line
  y += 5;

  doc.setFontSize(10);
  doc.text("CONTRATADO", 55, y, { align: "center" });
  doc.text("CONTRATANTE", 155, y, { align: "center" });
  
  y += 5;
  doc.setFontSize(9);
  doc.text(profile.name, 55, y, { align: "center" });
  doc.text(proposal.clientName, 155, y, { align: "center" });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Gerado digitalmente por Mil Eventos - Página ${i} de ${pageCount}`, 105, 290, {align: "center"});
  }

  doc.save(`Contrato_${proposal.clientName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};
