export interface IFormProps {
  context: any; 
}

export interface IfileData {
  id: number;
  offre_title: string;
  short_description: string;
  deadline: Date;
  city: string;
  fileType: string;
  file: File | null;
  fileName: string;
  fileUrl?: string;
  category: string;
  link: string;
}
