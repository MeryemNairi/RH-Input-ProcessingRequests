import * as React from 'react';
import { useState, useEffect } from 'react';
import { IFormProps, IFormData, getFormData, updatePdfForExistingRecord, } from './services/BackOfficeService';
import { sp } from '@pnp/sp/presets/all';
import Navbar from './Header/navbar';
import Footer from './Footer/footer';
import styles from './BackOffice.module.scss';
import { handleStatusChange, handleWordDownload } from './AttestationDeTravailPDF';



// BackOffice component definition
export const BackOffice: React.FC<IFormProps> = ({ context }) => {
  const [formEntries, setFormEntries] = useState<IFormData[]>([]);
  const [filterOption, setFilterOption] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [, setCurrentUser] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false); // To track upload status

  // Fetch form data and current user on component mount
  useEffect(() => {
    fetchFormData();
    fetchCurrentUserName();
  }, []);

  // Fetch form data from the server
  const fetchFormData = async () => {
    try {
      const formData = await getFormData();
      setFormEntries(formData);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  // Fetch current user's name
  const fetchCurrentUserName = async () => {
    try {
      const currentUser = await sp.web.currentUser.get();
      setCurrentUser(currentUser.Title);
    } catch (error) {
      console.error('Error fetching current user name:', error);
    }
  };

  // Handle status change for a specific entry
  const handleChangeStatus = (id: number, newStatus: string) => {
    handleStatusChange(formEntries, id, newStatus, setFormEntries);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle PDF upload for a specific entry
  const handleUploadPDF = async (entry: IFormData) => {
    if (!selectedFile) {
      alert('Please select a file before uploading.');
      return;
    }

    try {
      setUploading(true);

      // Create form data object with file and fileName
      const updatedEntry = {
        ...entry,
        file: selectedFile,
        fileName: selectedFile.name,
      };

      console.log('Uploading PDF for entry:', updatedEntry);

      // Call the service function to update the record with the PDF
      await updatePdfForExistingRecord(updatedEntry);

      alert('PDF uploaded successfully!');
      setSelectedFile(null); // Reset file input
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert(`An error occurred while uploading the PDF: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };



  // Extract unique cities from form entries
  const cities = [...new Set(formEntries.map((entry) => entry.city))];

  // Options for filtering records
  const options = [
    'Attestation de travail',
    'Attestation de salaire',
    'Domicialisation irrévocable de salaire',
    'Attestation de congé',
    'Attestation de salaire annuelle',
    'Borderaux de CNSS',
    'Attestation de titularisation',
    'Bulletins de paie cachetés',
  ];

  // Example status options
  const statusOptions: string[] = ['Pending', 'In Progress', 'Completed'];

  return (
    <div>
      <Navbar />
      <div>
      </div>
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                <h2 className={styles.recordsTitle}>Records</h2>
                <div style={{ marginBottom: '20px' }}>
                  <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
                    <option value="">Toutes les demandes</option>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    style={{ marginLeft: '20px' }}
                  >
                    <option value="">Toutes les villes</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.recordsContainer}>
                  {formEntries
                    .filter(
                      (entry) =>
                        (filterOption ? entry.offre_title === filterOption : true) &&
                        (cityFilter ? entry.city === cityFilter : true)
                    )
                    .map((entry, index) => (
                      <div key={index} className={styles.record}>
                        {entry.isTakenInCharge && entry.takenInChargeBy && (
                          <div className={styles.recordField}>
                            Already taken in charge by {entry.takenInChargeBy}
                          </div>
                        )}
                        <div className={styles.recordField}>Code: {entry.code}</div>
                        <div className={styles.recordField}>{entry.userEmail}</div>
                        <div className={styles.recordField}>{entry.offre_title}</div>
                        <div className={styles.recordField}>{entry.short_description}</div>
                        <div className={styles.recordField}>{entry.deadline.toLocaleDateString()}</div>
                        <div className={styles.recordField}>{entry.city}</div>
                        <div className={styles.recordField}>
                          <select
                            value={entry.status}
                            onChange={(e) => handleChangeStatus(entry.id, e.target.value)}
                          >
                            {statusOptions.map((status: string, index: number) => (
                              <option key={index} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <span className={styles.iconSpace}></span>

                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleWordDownload(entry)}>
                            <path d="M28.806 3H9.70499C9.54838 2.9996 9.39324 3.03013 9.24845 3.08982C9.10366 3.1495 8.97208 3.23719 8.86124 3.34783C8.75041 3.45848 8.66251 3.58992 8.60258 3.7346C8.54264 3.87929 8.51186 4.03439 8.51199 4.191V9.5L19.581 12.75L30 9.5V4.191C30.0001 4.0343 29.9693 3.87913 29.9093 3.73437C29.8493 3.58962 29.7613 3.45814 29.6504 3.34748C29.5395 3.23682 29.4078 3.14916 29.2628 3.08953C29.1179 3.0299 28.9627 2.99947 28.806 3Z" fill="#41A5EE" />
                            <path d="M30 9.5H8.51199V16L19.581 17.95L30 16V9.5Z" fill="#2B7CD3" />
                            <path d="M8.51199 16V22.5L18.93 23.8L30 22.5V16H8.51199Z" fill="#185ABD" />
                            <path d="M9.70499 29H28.805C28.9618 29.0007 29.1171 28.9703 29.2622 28.9108C29.4072 28.8512 29.539 28.7636 29.65 28.6529C29.7611 28.5422 29.8492 28.4107 29.9092 28.2659C29.9693 28.121 30.0001 27.9658 30 27.809V22.5H8.51199V27.809C8.51186 27.9656 8.54264 28.1207 8.60258 28.2654C8.66251 28.4101 8.75041 28.5415 8.86124 28.6522C8.97208 28.7628 9.10366 28.8505 9.24845 28.9102C9.39324 28.9699 9.54838 29.0004 9.70499 29Z" fill="#103F91" />
                            <path opacity="0.1" d="M16.434 8.2H8.51199V24.45H16.434C16.7497 24.4484 17.052 24.3225 17.2755 24.0996C17.499 23.8767 17.6256 23.5747 17.628 23.259V9.391C17.6256 9.07534 17.499 8.77332 17.2755 8.55039C17.052 8.32746 16.7497 8.20157 16.434 8.2Z" fill="black" />
                            <path opacity="0.2" d="M15.783 8.85H8.51199V25.1H15.783C16.0987 25.0984 16.401 24.9725 16.6245 24.7496C16.848 24.5267 16.9746 24.2247 16.977 23.909V10.041C16.9746 9.72534 16.848 9.42332 16.6245 9.20039C16.401 8.97746 16.0987 8.85157 15.783 8.85Z" fill="black" />
                            <path opacity="0.2" d="M15.783 8.85H8.51199V23.8H15.783C16.0987 23.7984 16.401 23.6725 16.6245 23.4496C16.848 23.2267 16.9746 22.9247 16.977 22.609V10.041C16.9746 9.72534 16.848 9.42332 16.6245 9.20039C16.401 8.97746 16.0987 8.85157 15.783 8.85Z" fill="black" />
                            <path opacity="0.2" d="M15.132 8.85H8.51199V23.8H15.132C15.4477 23.7984 15.75 23.6725 15.9735 23.4496C16.197 23.2267 16.3236 22.9247 16.326 22.609V10.041C16.3236 9.72534 16.197 9.42332 15.9735 9.20039C15.75 8.97746 15.4477 8.85157 15.132 8.85Z" fill="black" />
                            <path d="M3.194 8.85H15.132C15.4482 8.84974 15.7516 8.97503 15.9755 9.19836C16.1994 9.42169 16.3255 9.72477 16.326 10.041V21.959C16.3255 22.2752 16.1994 22.5783 15.9755 22.8016C15.7516 23.025 15.4482 23.1503 15.132 23.15H3.194C3.03731 23.1505 2.88205 23.1201 2.73715 23.0605C2.59224 23.0008 2.46054 22.9132 2.3496 22.8025C2.23866 22.6919 2.15067 22.5604 2.09068 22.4156C2.03068 22.2709 1.99987 22.1157 2 21.959V10.041C1.99987 9.88431 2.03068 9.72913 2.09068 9.58437C2.15067 9.43962 2.23866 9.30814 2.3496 9.19748C2.46054 9.08682 2.59224 8.99916 2.73715 8.93953C2.88205 8.8799 3.03731 8.84947 3.194 8.85Z" fill="url(#paint0_linear_2_7)" />
                            <path d="M6.9 17.988C6.92334 18.172 6.93867 18.3323 6.946 18.469H6.974C6.984 18.339 7.00567 18.1823 7.039 17.999C7.089 17.724 7.101 17.661 7.128 17.534L8.383 12.127H10.007L11.307 17.453C11.3821 17.7826 11.4362 18.1166 11.469 18.453H11.491C11.5159 18.1255 11.561 17.7999 11.626 17.478L12.665 12.12H14.142L12.318 19.868H10.591L9.354 14.742C9.318 14.594 9.27734 14.4013 9.232 14.164C9.18667 13.9267 9.15867 13.7533 9.148 13.644H9.127C9.113 13.77 9.085 13.957 9.043 14.205C9.001 14.453 8.96767 14.637 8.943 14.757L7.78 19.871H6.024L4.19 12.127H5.69L6.821 17.545C6.85397 17.6914 6.88033 17.8392 6.9 17.988Z" fill="white" />
                            <defs>
                              <linearGradient id="paint0_linear_2_7" x1="4.494" y1="7.914" x2="13.832" y2="24.086" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#2368C4" />
                                <stop offset="0.5" stop-color="#1A5DBE" />
                                <stop offset="1" stop-color="#1146AC" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className={styles.iconSpace}></span>

                        {/* File Upload Section */}
                        <label htmlFor={`fileUpload-${entry.id}`} className={styles.uploadButton}>
                            <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
                            <input
                              type="file"
                              accept=".pdf,.docx,.xlsx"
                              id={`fileUpload-${entry.id}`}
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 27 27"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11.25 18H15.75C16.3687 18 16.875 17.4937 16.875 16.875V11.25H18.6637C19.665 11.25 20.1712 10.035 19.4625 9.32625L14.2987 4.1625C14.1947 4.0582 14.071 3.97546 13.935 3.91901C13.7989 3.86255 13.653 3.8335 13.5056 3.8335C13.3583 3.8335 13.2124 3.86255 13.0763 3.91901C12.9402 3.97546 12.8166 4.0582 12.7125 4.1625L7.54875 9.32625C6.84 10.035 7.335 11.25 8.33625 11.25H10.125V16.875C10.125 17.4937 10.6312 18 11.25 18ZM6.75 20.25H20.25C20.8687 20.25 21.375 20.7562 21.375 21.375C21.375 21.9937 20.8687 22.5 20.25 22.5H6.75C6.13125 22.5 5.625 21.9937 5.625 21.375C5.625 20.7562 6.13125 20.25 6.75 20.25Z"
                                fill="#193A6A"
                              />
                            </svg>
                          </label>

                          {/* Submit PDF Button */}
                          <button
                            onClick={() => handleUploadPDF(entry)}
                            disabled={uploading || !selectedFile}
                          >
                            {uploading ? 'Uploading...' : 'Submit'}
                          </button>

                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

    </div>

  );
};
