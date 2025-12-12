import { Prisma } from '@prisma/client';

function stripProjectId(obj?: Record<string, unknown>) {
  if (obj && 'projectId' in obj) {
    delete obj.projectId;
  }
}

const projectIdTransform = Prisma.defineExtension({
  query: {
    electrification_project: {
      async create({ args, query }) {
        stripProjectId(args.data);
        return query(args);
      },

      async update({ args, query }) {
        stripProjectId(args.data);
        return query(args);
      },

      async upsert({ args, query }) {
        stripProjectId(args.create);
        stripProjectId(args.update);
        return query(args);
      }
    },

    housing_project: {
      async create({ args, query }) {
        stripProjectId(args.data);
        return query(args);
      },

      async update({ args, query }) {
        stripProjectId(args.data);
        return query(args);
      },

      async upsert({ args, query }) {
        stripProjectId(args.create);
        stripProjectId(args.update);
        return query(args);
      }
    }
  },
  result: {
    electrification_project: {
      projectId: {
        needs: { electrificationProjectId: true },
        compute(data: { electrificationProjectId: string }) {
          return data.electrificationProjectId;
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
