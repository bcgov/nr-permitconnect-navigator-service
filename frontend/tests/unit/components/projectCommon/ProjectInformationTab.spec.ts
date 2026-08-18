import ElectrificationProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import GeneralProjectForm from '@/components/general/project/ProjectFormNavigator.vue';
import HousingProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import ProjectInformationTab from '@/components/projectCommon/ProjectInformationTab.vue';
import { Action, Initiative, Resource } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';

import { mountComponent } from '../../../mountComponent';

import type { Project } from '@/types';

// Fixtures

const testProject = {
  projectId: 'project-1',
  activityId: 'activity-1',
  applicationStatus: ApplicationStatus.IN_PROGRESS
} as unknown as Project;

// Mount

function mountProjectInformationTab(
  options: {
    initiative?: Initiative;
    project?: Project;
    permissions?: { initiative: Initiative; resource: Resource; action: Action }[];
  } = {}
) {
  const { initiative = Initiative.HOUSING, permissions = [] } = options;
  // Not defaulted via destructuring -- a default there would also kick in
  // when a caller explicitly passes `project: undefined` to test the
  // no-project state, since JS applies parameter defaults on `undefined`.
  const project = 'project' in options ? options.project : testProject;

  const { wrapper } = mountComponent(ProjectInformationTab, {
    piniaState: {
      app: { initiative },
      project: { project },
      authz: { permissions }
    },
    stubs: {
      ElectrificationProjectForm: true,
      GeneralProjectForm: true,
      HousingProjectForm: true
    }
  });

  return { wrapper };
}

// Tests

describe('ProjectInformationTab', () => {
  describe('rendering', () => {
    it('renders nothing when no project has loaded', () => {
      const { wrapper } = mountProjectInformationTab({ project: undefined });

      expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(false);
      expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(false);
      expect(wrapper.findComponent(GeneralProjectForm).exists()).toBe(false);
    });

    it('renders nothing for an initiative with no matching form (e.g. PCNS)', () => {
      const { wrapper } = mountProjectInformationTab({ initiative: Initiative.PCNS });

      expect(wrapper.findComponent(HousingProjectForm).exists()).toBe(false);
      expect(wrapper.findComponent(ElectrificationProjectForm).exists()).toBe(false);
      expect(wrapper.findComponent(GeneralProjectForm).exists()).toBe(false);
    });

    it.each([
      [Initiative.ELECTRIFICATION, ElectrificationProjectForm],
      [Initiative.GENERAL, GeneralProjectForm],
      [Initiative.HOUSING, HousingProjectForm]
    ])('renders only the %s project form and passes it the project', (initiative, FormComponent) => {
      const { wrapper } = mountProjectInformationTab({ initiative });

      const form = wrapper.findComponent(FormComponent);
      expect(form.exists()).toBe(true);
      expect(form.props('project')).toEqual(testProject);
    });
  });

  describe('editable', () => {
    it('is editable when the project is incomplete and the user has update permission', () => {
      const { wrapper } = mountProjectInformationTab({
        project: { ...testProject, applicationStatus: ApplicationStatus.IN_PROGRESS },
        permissions: [{ initiative: Initiative.HOUSING, resource: Resource.HOUSING_PROJECT, action: Action.UPDATE }]
      });

      expect(wrapper.findComponent(HousingProjectForm).props('editable')).toBe(true);
    });

    it('is not editable when the project is completed, even with update permission', () => {
      const { wrapper } = mountProjectInformationTab({
        project: { ...testProject, applicationStatus: ApplicationStatus.COMPLETED },
        permissions: [{ initiative: Initiative.HOUSING, resource: Resource.HOUSING_PROJECT, action: Action.UPDATE }]
      });

      expect(wrapper.findComponent(HousingProjectForm).props('editable')).toBe(false);
    });

    it('is not editable when the user lacks update permission, even if the project is incomplete', () => {
      const { wrapper } = mountProjectInformationTab({
        project: { ...testProject, applicationStatus: ApplicationStatus.IN_PROGRESS },
        permissions: []
      });

      expect(wrapper.findComponent(HousingProjectForm).props('editable')).toBe(false);
    });
  });
});
