import Prisma from '@prisma/client';

import type { ProjectCategoryT, ProjectTypeT } from '../enums/electrification';

export const PROJECT_CATEGORY_LIST = Object.keys(Prisma.electrification_project_category) as Array<ProjectCategoryT>;

export const PROJECT_TYPE_LIST = Object.keys(Prisma.electrification_project_type) as Array<ProjectTypeT>;
