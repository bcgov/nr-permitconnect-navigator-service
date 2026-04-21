import { Prisma } from '@prisma/client';

const projectIdTransform = Prisma.defineExtension({
  result: {
    electrification_project: {
      projectId: {
        needs: { electrificationProjectId: true },
        compute(data: { electrificationProjectId: string }) {
          return data.electrificationProjectId;
        }
      }
    },
    general_project: {
      projectId: {
        needs: { generalProjectId: true },
        compute(data: { generalProjectId: string }) {
          return data.generalProjectId;
        }
      }
    },
    housing_project: {
      projectId: {
        needs: { housingProjectId: true },
        compute(data: { housingProjectId: string }) {
          return data.housingProjectId;
        }
      }
    }
  }
});

export default projectIdTransform;
