import { z } from 'zod';

export const schema = {
  getPids: {
    params: z.object({ projectId: z.string() }).strict()
  }
};
