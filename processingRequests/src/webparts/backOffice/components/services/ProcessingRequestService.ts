import { sp } from '@pnp/sp/presets/all';

export interface ProcessingRequest {
  datedetraitement?: Date;
  datedefindetraitement?: Date;
  username?: string;
}

export const ProcessingRequestService = {
  async takeInCharge(id: number, username: string) {
    const currentDate = new Date().toISOString();

    const item: ProcessingRequest = {
      datedetraitement: new Date(currentDate),
      username: username,
    };

    try {
      const list = sp.web.lists.getByTitle('processingRequest');
      await list.items.add(item);
    } catch (error) {
      console.error('Error taking in charge:', error);
      throw error;
    }
  },

  async release(id: number) {
    const currentDate = new Date().toISOString();

    const item: ProcessingRequest = {
      datedefindetraitement: new Date(currentDate),
    };

    try {
      const list = sp.web.lists.getByTitle('processingRequest');
      await list.items.getById(id).update(item);
    } catch (error) {
      console.error('Error releasing:', error);
      throw error;
    }
  },
};
