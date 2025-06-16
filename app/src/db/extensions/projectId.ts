import { Prisma } from '@prisma/client';

const projectIdAlias = Prisma.defineExtension({
  result: {
    electrification_project: {
      projectId: {
        needs: { electrificationProjectId: true },
        compute(data: { electrificationProjectId: string }): string {
          return data.electrificationProjectId;
        }
      }
    },
    housing_project: {
      projectId: {
        needs: { housingProjectId: true },
        compute(data: { housingProjectId: string }): string {
          return data.housingProjectId;
        }
      }
    }
  }
});

export default projectIdAlias;
