import { sp } from '@pnp/sp/presets/all';
import { WebPartContext } from '@microsoft/sp-webpart-base';

// Define the interface for form properties
export interface IFormProps {
  context: WebPartContext;
}



// Define the interface for form data
export interface IFormData {
  id: number;
  offre_title: string;
  short_description: string;
  deadline: Date;
  userEmail: string;
  IdBoost: number;
  status: string;
  isTakenInCharge?: boolean;
  city: string;  
  code: string; 
  takenInChargeBy?: string; 
  datefin?: Date; // Include datefin
  userName?: string;
  userCIN?: string;
  userCNSS?: string;
  userJobTitle?: string;
  employmentStartDate?: string;
  pdfLink?: string; // Add pdfLink to store the PDF link
}

// Define the interface for file data
export interface IFormData2 {
  id: number;
  file: File | null;
  fileName: string;
}

// Function to upload PDF and update the corresponding record in the Communication list
export const updatePdfForExistingRecord = async (formData: IFormData2 & IFormData) => {
  try {
    // Check if the file is a PDF
    if (formData.file) {
      const fileName = formData.file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      // Allow only PDF files
      if (fileExtension !== 'pdf') {
        throw new Error('Only PDF files are allowed.');
      }

      // Upload the PDF file
      const fileItem = await sp.web.lists.getByTitle('AttestationsPdf').rootFolder.files.add(fileName, formData.file, true);
      const fileUrl = fileItem.data.ServerRelativeUrl;

      // Retrieve the existing record by IdBoost
      const list = sp.web.lists.getByTitle('Communication');
      const items = await list.items.filter(`IdBoost eq '${formData.IdBoost}'`).get();

      if (items.length === 0) {
        throw new Error('No record found for the given IdBoost.');
      }

      // Update the record with the PDF link
      const itemId = items[0].Id; // Get the ID of the existing item
      await list.items.getById(itemId).update({
        pdfLink: fileUrl,  // Update the PDF link
        offre_title: formData.offre_title, // Include other necessary fields
        short_description: formData.short_description,
        deadline: formData.deadline.toISOString(),
        userEmail: formData.userEmail,
        IdBoost: formData.IdBoost,
        status: formData.status,
        city: formData.city,
        code: formData.code,
      });
    }
  } catch (error) {
    console.error('Error updating PDF link:', error);
    throw new Error('An error occurred while updating the PDF link. Please try again.');
  }
};

// Function to submit form data to the Communication list
export const submitForm = async (formData: IFormData) => {
  try {
    const list = sp.web.lists.getByTitle('Communication');
    await list.items.add({
      offre_title: formData.offre_title, 
      short_description: formData.short_description, 
      deadline: formData.deadline.toISOString(),
      userEmail: formData.userEmail,
      IdBoost: formData.IdBoost,
      status: formData.status, 
      city: formData.city, 
      code: formData.code,
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    throw new Error('An error occurred while submitting the form. Please try again.');
  }
};

// Function to retrieve form data from the Communication list
export const getFormData = async (): Promise<IFormData[]> => {
  try {
    const list = sp.web.lists.getByTitle('Communication');
    const items = await list.items.select('Id', 'offre_title', 'short_description', 'deadline', 'userEmail', 'IdBoost', 'status', 'city', 'code').get();
    return items.map((item: any) => ({
      id: item.Id,
      offre_title: item.offre_title,
      short_description: item.short_description,
      deadline: new Date(item.deadline),
      userEmail: item.userEmail,
      IdBoost: item.IdBoost,
      status: item.status,
      city: item.city,   
      code: item.code,
      pdfLink: item.pdfLink,  // Include pdfLink in the returned data
    }));
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw new Error('An error occurred while fetching form data. Please try again.');
  }
};

// Function to update a specific form entry by ID
export const updateFormEntry = async (id: number, formData: IFormData) => {
  try {
    const list = sp.web.lists.getByTitle('Communication');
    await list.items.getById(id).update({
      offre_title: formData.offre_title, 
      short_description: formData.short_description, 
      deadline: formData.deadline.toISOString(), 
      userEmail: formData.userEmail,
      IdBoost: formData.IdBoost,
      status: formData.status,
      city: formData.city,
      code: formData.code,
    });
  } catch (error) {
    console.error('Error updating form entry:', error);
    throw new Error('An error occurred while updating the form entry. Please try again.');
  }
};

// Function to delete a specific form entry by ID
export const deleteFormEntry = async (id: number) => {
  try {
    const list = sp.web.lists.getByTitle('Communication');
    await list.items.getById(id).delete();
  } catch (error) {
    console.error('Error deleting form entry:', error);
    throw new Error('An error occurred while deleting the form entry. Please try again.');
  }
};


// FormService.ts

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


export const submitForm2 = async (formData: IfileData) => {
  try {
    const fileItem = await sp.web.lists.getByTitle('BackOfficeV0').rootFolder.files.add(formData.file!.name, formData.file!, true);
    const fileUrl = fileItem.data.ServerRelativeUrl;

    const list = sp.web.lists.getByTitle('BackOfficeV1');
    await list.items.add({
      offre_title: formData.offre_title, 
      short_description: formData.short_description, 
      deadline: formData.deadline.toISOString(),
      city: formData.city, 
      fileType: formData.fileType, 
      fileUrl: fileUrl,
      fileName: formData.file ? formData.file.name : '',
      category: formData.category ,
      link: formData.link 

    });
  } catch (error) {
    console.error('Error submitting form:', error);
    throw new Error('An error occurred while submitting the form. Please try again.');
  }
};

export const getFormData2 = async (): Promise<IfileData[]> => {
  try {
    const list = sp.web.lists.getByTitle('BackOfficeV1');
    const items = await list.items.orderBy('Id', false).select('Id', 'offre_title', 'short_description', 'deadline', 'city', 'fileType', 'fileUrl', 'fileName', 'category','link' ).get();
    return items.map((item: any) => ({
      id: item.Id,
      offre_title: item.offre_title,
      short_description: item.short_description,
      deadline: new Date(item.deadline),
      city: item.city,
      fileType: item.fileType,
      file: null,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      category: item.category ,
      link: item.link 

    }));
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw new Error('An error occurred while fetching form data. Please try again.');
  }
};

export const updateFormEntry2 = async (id: number, formData: IfileData) => {
  try {
    const list = sp.web.lists.getByTitle('BackOfficeV1');
    await list.items.getById(id).update({
      offre_title: formData.offre_title, 
      short_description: formData.short_description, 
      deadline: formData.deadline.toISOString(), 
      city: formData.city, 
      fileType: formData.fileType,
      category: formData.category ,
      link: formData.link

    });
  } catch (error) {
    console.error('Error updating form entry:', error);
    throw new Error('An error occurred while updating the form entry. Please try again.');
  }
};

export const deleteFormEntry2 = async (id: number) => {
  try {
    const list = sp.web.lists.getByTitle('BackOfficeV1');
    await list.items.getById(id).delete();
  } catch (error) {
    console.error('Error deleting form entry:', error);
    throw new Error('An error occurred while deleting the form entry. Please try again.');
  }
};

export const deleteFormDataBeforeToday = async () => {

  try {

    const list = sp.web.lists.getByTitle('BackOfficeV1');



    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() - 1);



    // Filtrer les éléments dont la deadline est strictement inférieure à "aujourd'hui + 1 jour"

    const items = await list.items

      .select('Id', 'deadline')

      .filter(`deadline lt datetime'${tomorrow.toISOString()}'`)

      .get();



    // Supprimer les éléments filtrés

    await Promise.all(items.map(async (item: any) => {

      await list.items.getById(item.Id).delete();

    }));



    console.log('Entries deleted successfully.');

  } catch (error) {

    console.error('Error deleting form entries before today:', error);

    throw new Error('An error occurred while deleting form entries before today. Please try again.');

  }

};