import { nextTick } from 'vue';

import { EditableSelect, Select } from '@/components/form';
import SubmissionStateSection from '@/components/form/section/SubmissionStateSection.vue';
import { userService } from '@/services';
import { useFormStore } from '@/store';
import { IdentityProviderKind, Initiative } from '@/utils/enums/application';
import {
  APPLICATION_STATUS_LIST,
  AREA_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST,
  QUEUE_PRIORITY,
  REGION_LIST,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { User } from '@/types';

// Mocks

const listUsersSpy = vi.spyOn(userService, 'listUsers');

// Fixtures

const azureIdp = { kind: IdentityProviderKind.AZUREIDIR, idp: 'azureidir' };

// Mount

function mountSubmissionStateSection(
  options: {
    tab?: number;
    isEnquiry?: boolean;
    initiative?: Initiative;
    formType?: FormType;
    formState?: FormState;
    project?: Record<string, unknown>;
    enquiry?: Record<string, unknown>;
    idpConfigured?: boolean;
  } = {}
) {
  const {
    tab,
    isEnquiry,
    initiative = Initiative.HOUSING,
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    project,
    enquiry,
    idpConfigured = true
  } = options;

  const { wrapper, pinia, form } = mountWithFormContext(SubmissionStateSection, {
    piniaState: {
      app: { initiative },
      form: { formType, formState },
      project: { project },
      enquiry: { enquiry },
      config: { config: { idpList: idpConfigured ? [azureIdp] : [] } }
    },
    componentProps: { ...(tab === undefined ? {} : { tab }), ...(isEnquiry === undefined ? {} : { isEnquiry }) }
  });

  const formStore = useFormStore(pinia!);

  return { wrapper, formStore, form };
}

beforeEach(() => {
  vi.clearAllMocks();
  listUsersSpy.mockResolvedValue([]);
});

// Tests

describe('SubmissionStateSection', () => {
  describe('rendering', () => {
    it('renders an EditableSelect bound to submissionState.assignedUser', () => {
      const { wrapper } = mountSubmissionStateSection();

      const assignedUser = wrapper.findComponent(EditableSelect);
      expect(assignedUser.exists()).toBe(true);
      expect(assignedUser.props('name')).toBe('submissionState.assignedUser');
    });

    it('renders a non-empty translated header', () => {
      const { wrapper } = mountSubmissionStateSection();

      expect(wrapper.find('h4').text().trim().length).toBeGreaterThan(0);
    });

    describe('project fields (isEnquiry=false)', () => {
      it('renders the applicationStatus, submissionType, and queuePriority selects', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: false, initiative: Initiative.HOUSING });

        const selects = wrapper.findAllComponents(Select);
        const names = selects.map((s) => s.props('name'));
        expect(names).toContain('submissionState.applicationStatus');
        expect(names).toContain('submissionState.submissionType');
        expect(names).toContain('submissionState.queuePriority');
      });

      it('passes the expected options to each project select', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: false, initiative: Initiative.HOUSING });

        const selects = wrapper.findAllComponents(Select);
        const byName = (name: string) => selects.find((s) => s.props('name') === name)!;
        expect(byName('submissionState.applicationStatus').props('options')).toEqual(APPLICATION_STATUS_LIST);
        expect(byName('submissionState.submissionType').props('options')).toEqual(SUBMISSION_TYPE_LIST);
        expect(byName('submissionState.queuePriority').props('options')).toEqual(QUEUE_PRIORITY);
      });

      it('renders region and area selects only for the GENERAL initiative', () => {
        const { wrapper: housing } = mountSubmissionStateSection({ isEnquiry: false, initiative: Initiative.HOUSING });
        const housingNames = housing.findAllComponents(Select).map((s) => s.props('name'));
        expect(housingNames).not.toContain('submissionState.region');
        expect(housingNames).not.toContain('submissionState.area');

        const { wrapper: general } = mountSubmissionStateSection({ isEnquiry: false, initiative: Initiative.GENERAL });
        const generalSelects = general.findAllComponents(Select);
        const generalNames = generalSelects.map((s) => s.props('name'));
        expect(generalNames).toContain('submissionState.region');
        expect(generalNames).toContain('submissionState.area');
        expect(generalSelects.find((s) => s.props('name') === 'submissionState.region')!.props('options')).toEqual(
          REGION_LIST
        );
        expect(generalSelects.find((s) => s.props('name') === 'submissionState.area')!.props('options')).toEqual(
          AREA_LIST
        );
      });

      it('does not render the enquiry-only fields', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: false });

        const names = [
          ...wrapper.findAllComponents(Select).map((s) => s.props('name')),
          ...wrapper.findAllComponents(EditableSelect).map((s) => s.props('name'))
        ];
        expect(names).not.toContain('submissionState.submittedMethod');
        expect(names).not.toContain('submissionState.enquiryStatus');
      });
    });

    describe('enquiry fields (isEnquiry=true)', () => {
      it('renders the submittedMethod, enquiryStatus, and submissionType fields', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: true });

        const editableNames = wrapper.findAllComponents(EditableSelect).map((s) => s.props('name'));
        const selectNames = wrapper.findAllComponents(Select).map((s) => s.props('name'));
        expect(editableNames).toContain('submissionState.submittedMethod');
        expect(selectNames).toContain('submissionState.enquiryStatus');
        expect(selectNames).toContain('submissionState.submissionType');
      });

      it('passes the expected options to the enquiry fields', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: true });

        const submittedMethod = wrapper
          .findAllComponents(EditableSelect)
          .find((s) => s.props('name') === 'submissionState.submittedMethod')!;
        const submissionType = wrapper
          .findAllComponents(Select)
          .find((s) => s.props('name') === 'submissionState.submissionType')!;
        expect(submittedMethod.props('options')).toEqual(ENQUIRY_SUBMITTED_METHOD);
        expect(submissionType.props('options')).toEqual(ENQUIRY_TYPE_LIST);
      });

      it('does not render the project-only fields', () => {
        const { wrapper } = mountSubmissionStateSection({ isEnquiry: true, initiative: Initiative.GENERAL });

        const names = wrapper.findAllComponents(Select).map((s) => s.props('name'));
        expect(names).not.toContain('submissionState.region');
        expect(names).not.toContain('submissionState.area');
        expect(names).not.toContain('submissionState.queuePriority');
      });
    });
  });

  describe('assignee loading', () => {
    it('loads the assignee by the project assignedUserId when not an enquiry', async () => {
      listUsersSpy.mockResolvedValue([{ userId: 'user-1' } as User]);

      mountSubmissionStateSection({
        isEnquiry: false,
        project: { activityId: 'activity-1', assignedUserId: 'user-1' }
      });
      await nextTick();
      await nextTick();

      expect(listUsersSpy).toHaveBeenCalledWith({ userId: ['user-1'] });
    });

    it('loads the assignee by the enquiry assignedUserId when isEnquiry is true', async () => {
      mountSubmissionStateSection({
        isEnquiry: true,
        enquiry: { activityId: 'activity-1', assignedUserId: 'user-2' }
      });
      await nextTick();
      await nextTick();

      expect(listUsersSpy).toHaveBeenCalledWith({ userId: ['user-2'] });
    });

    it('does not attempt to load an assignee when there is no assignedUserId', async () => {
      mountSubmissionStateSection({ isEnquiry: false, project: { activityId: 'activity-1' } });
      await nextTick();
      await nextTick();

      expect(listUsersSpy).not.toHaveBeenCalled();
    });
  });

  describe('form error reporting', () => {
    it('reports an error to the store when vee-validate has one on its field', async () => {
      const { formStore, form } = mountSubmissionStateSection({ tab: 3 });

      form.setErrors({ 'submissionState.assignedUser': 'Required' });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenCalledWith('SubmissionStateSection', 3, true);
    });

    it('clears the error once vee-validate reports the field as valid again', async () => {
      const { formStore, form } = mountSubmissionStateSection();

      form.setErrors({ 'submissionState.assignedUser': 'Required' });
      await nextTick();

      form.setErrors({ 'submissionState.assignedUser': undefined });
      await nextTick();

      expect(formStore.setFormError).toHaveBeenLastCalledWith('SubmissionStateSection', 0, false);
    });
  });
});
