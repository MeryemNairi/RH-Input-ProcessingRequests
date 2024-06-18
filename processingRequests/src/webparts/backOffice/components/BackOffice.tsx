import * as React from 'react';
import { useState, useEffect } from 'react';
import { IFormProps, IFormData } from './services/BackOfficeService';
import { getFormData, updateFormEntry, deleteFormEntry } from './services/BackOfficeService';
import { ProcessingRequestService } from './services/ProcessingRequestService';
import { sp } from "@pnp/sp/presets/all";
import Navbar from './Header/navbar';
import Footer from './Footer/footer';
import styles from './BackOffice.module.scss';

export const BackOffice: React.FC<IFormProps> = ({ context }) => {
  const [formEntries, setFormEntries] = useState<IFormData[]>([]);
  const [filterOption, setFilterOption] = useState('');

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const formData = await getFormData();
      setFormEntries(formData);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteFormEntry(id);
        alert('Form entry deleted successfully!');
        fetchFormData();
      } catch (error) {
        console.error('Error deleting form entry:', error);
        alert('An error occurred while deleting the form entry. Please try again.');
      }
    }
  };

  const fetchCurrentUserName = async () => {
    try {
      const currentUser = await sp.web.currentUser.get();
      return currentUser.Title;
    } catch (error) {
      console.error('Error fetching current user name:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUserName().then((username) => {
      setFormEntries(prevEntries =>
        prevEntries.map(entry => ({
          ...entry,
          username: username || '',
          isTakenInCharge: entry.isTakenInCharge || false
        }))
      );
    });
  }, []);

  const statusOptions = [
    'pending',
    'in progress',
    'resolved',
    'closed',
    'rejected'
  ];

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const updatedEntry = formEntries.find(entry => entry.id === id);
      if (updatedEntry) {
        updatedEntry.status = newStatus;
        await updateFormEntry(id, updatedEntry);
        fetchFormData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status. Please try again.');
    }
  };

  const handleTakeInCharge = async (id: number) => {
    try {
      const username = await fetchCurrentUserName();
      await ProcessingRequestService.takeInCharge(id, username || '');
      const updatedEntries = formEntries.map(entry =>
        entry.id === id ? { ...entry, isTakenInCharge: true } : entry
      );
      setFormEntries(updatedEntries);
    } catch (error) {
      console.error('Error taking in charge:', error);
      alert('An error occurred while taking in charge. Please try again.');
    }
  };

  const handleRelease = async (id: number) => {
    try {
      await ProcessingRequestService.release(id);
      const updatedEntries = formEntries.map(entry =>
        entry.id === id ? { ...entry, isTakenInCharge: false, datedefindetraitement: new Date() } : entry
      );
      setFormEntries(updatedEntries);
    } catch (error) {
      console.error('Error releasing:', error);
      alert('An error occurred while releasing. Please try again.');
    }
  };

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

  return (
    <div>
      <Navbar />
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div>
            <div style={{ marginBottom: '50px' }}></div>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                <h2 className={styles.recordsTitle}>Records</h2>
                <div style={{ marginBottom: '20px' }}>
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                  >
                    <option value="">Toutes les demandes</option>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.recordsContainer}>
                  {formEntries
                    .filter(entry => filterOption ? entry.offre_title === filterOption : true)
                    .map((entry, index) => (
                      <div key={index} className={`${styles.record} ${entry.isTakenInCharge ? '' : styles.recordGrayed}`}>
                        <div className={styles.recordField}>{entry.userEmail}</div>
                        <div className={styles.recordField}>{entry.offre_title}</div>
                        <div className={styles.recordField}>{entry.short_description}</div>
                        <div className={styles.recordField}>{entry.IdBoost}</div>
                        <div className={styles.recordField}>{entry.deadline.toLocaleDateString()}</div>
                        <div className={styles.recordField}>
                          <select
                            value={entry.status}
                            onChange={(e) => handleStatusChange(entry.id, e.target.value)}
                            disabled={!entry.isTakenInCharge}
                          >
                            {statusOptions.map((status, index) => (
                              <option key={index} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.recordField}>
                          {entry.isTakenInCharge ? (
                            <button onClick={() => handleRelease(entry.id)}>Libérer</button>
                          ) : (
                            <button onClick={() => handleTakeInCharge(entry.id)}>Prendre en charge</button>
                          )}
                        </div>
                        <div className={styles.recordField}>
                          <button onClick={() => handleDeleteEntry(entry.id)} disabled={!entry.isTakenInCharge}>Supprimer</button>
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

export default BackOffice;
