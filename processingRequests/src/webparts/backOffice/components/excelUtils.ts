import * as XLSX from 'xlsx';

// Fonction pour lire les données d'un fichier Excel
export const readExcelData = (filePath: string) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Prend la première feuille
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
};

// Fonction pour récupérer les informations de l'utilisateur par IDBOOST
export const getUserInfoByIdBoost = (idBoost: number, data: any[]) => {
  return data.find((user) => user.IDBOOST === idBoost);
};
