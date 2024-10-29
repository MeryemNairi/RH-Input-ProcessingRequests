import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { IFormData } from './services/BackOfficeService';
import html2canvas from "html2canvas";


export const generateAttestationPDF = async (content: string) => {
  // Créer un élément temporaire pour le contenu HTML
  const element = document.createElement('div');
  element.innerHTML = content;
  element.style.width = '210mm'; // Largeur pour A4
  element.style.padding = '10mm'; // Marges pour éviter que le contenu touche les bords

  // Ajout de l'élément au document (temporairement pour la capture)
  document.body.appendChild(element);

  // Utiliser html2canvas pour capturer l'élément en tant qu'image
  const canvas = await html2canvas(element, {
    scale: 2, // Augmente l'échelle pour améliorer la qualité de l'image
    scrollY: 0, // Fixer le scrolling pour éviter les captures incorrectes
    useCORS: true // Gère le contenu cross-origin si nécessaire
  });

  // Convertir l'image capturée en format PNG
  const imgData = canvas.toDataURL('image/png');

  // Initialiser jsPDF pour une page A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Largeur et hauteur de l'image dans le PDF
  const imgWidth = 210; // A4 = 210mm de largeur
  const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcul proportionnel de la hauteur

  // Ajouter l'image capturée au PDF avec un léger décalage pour l'espace en haut
  doc.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight); // Positionner l'image un peu plus bas

  // Télécharger le PDF sous le nom AttestationDeTravail.pdf
  doc.save('AttestationDeTravail.pdf');

  // Retirer l'élément temporaire ajouté au document
  document.body.removeChild(element);
};

// Fonction pour gérer le téléchargement du PDF
export const handleDownloadPDF = (content: string) => {
  generateAttestationPDF(content); // Appel de la fonction pour générer le PDF
};

// Fonction pour obtenir les données de l'utilisateur à partir du fichier Excel
export const getUserDataById = async (id: string): Promise<any> => {
  const filePath = '/sites/Cnet/Assets/FilesPdf/DatabaseFictif.xlsx';
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // On suppose que les données sont dans la première feuille
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  const user = jsonData.find((user: any) => user.IDBOOST.toString() === id);

  return user || null;
};

// Fonction pour changer le statut d'une entrée de formulaire
export const handleStatusChange = (
  formEntries: IFormData[],
  id: number,
  newStatus: string,
  setFormEntries: React.Dispatch<React.SetStateAction<IFormData[]>>
) => {
  setFormEntries((prevEntries) =>
    prevEntries.map((entry) =>
      entry.id === id ? { ...entry, status: newStatus } : entry
    )
  );
};

// Function to format date to jj/mm/aaaa
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const handlePDFDownload = async (entry: IFormData) => {
  if (entry.offre_title === 'Attestation de travail') {
    // Get user data by IdBoost
    const userData = await getUserDataById(entry.IdBoost.toString());

    if (userData) {
      // Custom content for the PDF
      const content = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Attestation de Travail</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #ffffff;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: #fff;
                  padding: 20px;
                  border-radius: 8px;
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px; /* Espace ajusté entre le logo et le titre */
              }
              .logo {
                  max-width: 100px;
                  height: auto;
                  display: block;
                  margin-right: 20px;
              }
              h1.underline {
                  font-size: 24px;
                  margin: 20px 0;
                  text-decoration: underline;
                  font-weight: bold;
                  text-align: center; /* Centrer le titre */
              }
              p {
                  line-height: 1.6;
                  margin-bottom: 30px; /* Ajouter un espacement plus grand entre les paragraphes */
                  font-size: 14px;
              }
              .footer {
                  margin-top: 80px; /* Espace ajusté avant le footer */
                  text-align: right;
                  line-height: 1.6;
                  font-size: 14px;
              }
              .footer p {
                  margin-bottom: 5px; /* Espacement réduit entre les lignes du footer */
              }
              .footer-extended {
                  margin-top: 100px; /* Ajout d'un grand espace avant le footer */
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://cnexia.sharepoint.com/:i:/r/sites/Cnet/Assets/cnexialogo.png?csf=1&web=1&e=7h7IhM" alt="Cnexia Logo" class="logo">
             </div>
             <div>
                  <h1 class="underline">Attestation de Travail</h1>
              </div>   
              <p>
                  Nous soussignés la Société Cnexia, SAS au Capital de 84 802 500,00 de dirhams, située à Technopolis, Bâtiment B 11 Sala-Al-Jadida, Rabat, attestons par la présente que
              </p>
              <p>
              <strong>M. ${userData.NOM} ${userData.PRENOM}</strong>, titulaire de la <strong>CIN N° ${userData.CIN}</strong>, immatriculé(e) à la <strong>CNSS</strong> sous le <strong>N° ${userData.CNSS}</strong>, est employé(e) en qualité de <strong>${userData.FONCTION}</strong> au sein de notre Société depuis le <strong>${formatDate(userData['DATE D\'INTEGRATION'])}</strong> à ce jour.
              </p>
              <p>
                  La présente attestation est délivrée à la demande de l’intéressé(e) pour servir et valoir ce que de droit.
              </p>
              <div class="footer footer-extended">
                  <p>Fait à Rabat, le ${new Date().toLocaleDateString()}</p>
                  <p><strong>Adil Alaoui Mhamedi</strong><br>People Operations</p>
              </div>
          </div>
      </body>
      </html>
      `;

      // Call the function to generate the PDF
      handleDownloadPDF(content);
    } else {
      alert("Aucune donnée utilisateur trouvée pour l'ID spécifié.");
    }
  } else {
    alert("La génération de PDF est uniquement disponible pour l'Attestation de travail.");
  }
};

export const handleWordDownload = async (entry: IFormData) => {
  if (entry.offre_title === 'Attestation de travail') {
    // Get user data by IdBoost
    const userData = await getUserDataById(entry.IdBoost.toString());

    if (userData) {
      // Custom content for the Word document
      const content = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Attestation de Travail</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #ffffff;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: #fff;
                  padding: 20px;
                  border-radius: 8px;
              }
              .header {
                  text-align: center;
                  margin-bottom: 30px; /* Espace ajusté entre le logo et le titre */
              }
              .logo {
                  max-width: 100px;
                  height: auto;
                  display: block;
                  margin-right: 20px;
              }
              h1.underline {
                  font-size: 24px;
                  margin: 20px 0;
                  text-decoration: underline;
                  font-weight: bold;
                  text-align: center; /* Centrer le titre */
              }
              p {
                  line-height: 1.6;
                  margin-bottom: 30px; /* Ajouter un espacement plus grand entre les paragraphes */
                  font-size: 14px;
              }
              .footer {
                  margin-top: 80px; /* Espace ajusté avant le footer */
                  text-align: right;
                  line-height: 1.6;
                  font-size: 14px;
              }
              .footer p {
                  margin-bottom: 5px; /* Espacement réduit entre les lignes du footer */
              }
              .footer-extended {
                  margin-top: 100px; /* Ajout d'un grand espace avant le footer */
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://cnexia.sharepoint.com/:i:/r/sites/Cnet/Assets/cnexialogo.png?csf=1&web=1&e=7h7IhM" alt="Cnexia Logo" class="logo">
             </div>
             <div>
                  <h1 class="underline">Attestation de Travail</h1>
              </div>   
              <p>
                  Nous soussignés la Société Cnexia, SAS au Capital de 84 802 500,00 de dirhams, située à Technopolis, Bâtiment B 11 Sala-Al-Jadida, Rabat, attestons par la présente que
              </p>
              <p>
              <strong>M. ${userData.NOM} ${userData.PRENOM}</strong>, titulaire de la <strong>CIN N° ${userData.CIN}</strong>, immatriculé(e) à la <strong>CNSS</strong> sous le <strong>N° ${userData.CNSS}</strong>, est employé(e) en qualité de <strong>${userData.FONCTION}</strong> au sein de notre Société depuis le <strong>${formatDate(userData['DATE D\'INTEGRATION'])}</strong> à ce jour.
              </p>
              <p>
                  La présente attestation est délivrée à la demande de l’intéressé(e) pour servir et valoir ce que de droit.
              </p>
              <div class="footer footer-extended">
                  <p>Fait à Rabat, le ${new Date().toLocaleDateString()}</p>
                  <p><strong>Adil Alaoui Mhamedi</strong><br>People Operations</p>
              </div>
          </div>
      </body>
      </html>
      `;

      // Call the function to generate the Word document
      handleDownloadWord(content);
    } else {
      alert("Aucune donnée utilisateur trouvée pour l'ID spécifié.");
    }
  } else {
    alert("La génération de document Word est uniquement disponible pour l'Attestation de travail.");
  }
};

// Function to generate Word document content
const handleDownloadWord = (content: string) => {
  const blob = new Blob([content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Attestation_de_Travail.doc';
  a.click();
  URL.revokeObjectURL(url);
};