import { sp } from '@pnp/sp/presets/all';

export interface ProcessingRequest {
  datedetraitement?: Date;
  datedefindetraitement?: Date;
  username?: string;
  code?: string;
}

export const ProcessingRequestService = {
  async takeInCharge(id: number, username: string, code: string) {
    const currentDate = new Date().toISOString();

    const item: ProcessingRequest = {
      datedetraitement: new Date(currentDate),
      username: username,
      code: code,
    };

    try {
      const list = sp.web.lists.getByTitle('processingRequest');
      await list.items.add(item);
    } catch (error) {
      console.error('Error taking in charge:', error);
      throw error;
    }
  },

  
  async release(code: string) {
    try {
      const currentDate = new Date().toISOString();

      const item: ProcessingRequest = {
        datedefindetraitement: new Date(currentDate),
      };

      const list = sp.web.lists.getByTitle('processingRequest');
      const items = await list.items.filter(`code eq '${code}'`).get();

      if (items.length === 1) {
        const requestItem = items[0];
        await list.items.getById(requestItem.Id).update(item);
      } else if (items.length === 0) {
        console.error('Item not found:', code);
        throw new Error('Item not found');
      } else {
        console.error('Multiple items found with the same code:', code);
        throw new Error('Multiple items found');
      }
    } catch (error) {
      console.error('Error releasing:', error);
      throw error;
    }
  }
};
