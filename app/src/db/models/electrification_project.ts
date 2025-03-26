import { Prisma } from '@prisma/client';

import contact from './contact';
import user from './user';

import type { Stamps } from '../stamps';
import type { ElectrificationProject } from '../../types';

// Define types
const _electrificationProject = Prisma.validator<Prisma.electrification_projectDefaultArgs>()({});
const _electrificationProjectWithContactGraph = Prisma.validator<Prisma.electrification_projectDefaultArgs>()({
  include: {
    activity: {
      include: {
        activity_contact: {
          include: {
            contact: true
          }
        }
      }
    }
  }
});
const _electrificationProjectWithUserGraph = Prisma.validator<Prisma.electrification_projectDefaultArgs>()({
  include: {
    activity: {
      include: {
        activity_contact: {
          include: {
            contact: true
          }
        }
      }
    },
    user: true
  }
});

type PrismaRelationElectrificationProject = Omit<
  Prisma.electrification_projectGetPayload<typeof _electrificationProject>,
  keyof Stamps
>;
type PrismaGraphElectrificationProject = Prisma.electrification_projectGetPayload<typeof _electrificationProject>;
type PrismaGraphElectrificationProjectWithContact = Prisma.electrification_projectGetPayload<
  typeof _electrificationProjectWithContactGraph
>;
type PrismaGraphElectrificationProjectWithUser = Prisma.electrification_projectGetPayload<
  typeof _electrificationProjectWithUserGraph
>;

export default {
  toPrismaModel(input: ElectrificationProject): PrismaRelationElectrificationProject {
    return {
      electrification_project_id: input.electrificationProjectId,
      activity_id: input.activityId,
      assigned_user_id: input.assignedUserId,
      submitted_at: new Date(input.submittedAt ?? Date.now()),
      project_name: input.projectName,
      project_description: input.projectDescription,
      company_name_registered: input.companyNameRegistered,
      project_type: input.projectType,
      bc_hydro_number: input.bcHydroNumber,
      submission_type: input.submissionType
    };
  },

  fromPrismaModel(input: PrismaGraphElectrificationProject): ElectrificationProject {
    return {
      electrificationProjectId: input.electrification_project_id,
      activityId: input.activity_id,
      assignedUserId: input.assigned_user_id,
      submittedAt: input.submitted_at?.toISOString() as string,
      projectName: input.project_name,
      projectDescription: input.project_description,
      companyNameRegistered: input.company_name_registered,
      projectType: input.project_type,
      bcHydroNumber: input.bc_hydro_number,
      submissionType: input.submission_type,

      createdBy: input.created_by,
      updatedAt: input.updated_at?.toISOString() as string,
      contacts: [],
      user: null
    };
  },

  fromPrismaModelWithContact(input: PrismaGraphElectrificationProjectWithContact): ElectrificationProject {
    const electrificationProject = this.fromPrismaModel(input);
    if (electrificationProject && input.activity.activity_contact) {
      electrificationProject.contacts = input.activity.activity_contact.map((x) => contact.fromPrismaModel(x.contact));
    }

    return electrificationProject;
  },

  fromPrismaModelWithUser(input: PrismaGraphElectrificationProjectWithUser): ElectrificationProject {
    const electrificationProject = this.fromPrismaModelWithContact(input);
    if (electrificationProject && input.user) {
      electrificationProject.user = user.fromPrismaModel(input.user);
    }

    return electrificationProject;
  }
};
