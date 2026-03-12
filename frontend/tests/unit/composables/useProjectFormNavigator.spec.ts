import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

import { useProjectFormNavigator } from '@/composables/useProjectFormNavigator';
import { atsService, externalApiService, userService } from '@/services';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { ATSCreateTypes, Initiative } from '@/utils/enums/application';
import { ApplicationStatus, ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import * as utils from '@/utils/utils';
import { mockAxiosResponse } from '../../helpers';

import type { Form, GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { Contact, User } from '@/types';
import type { IInputEvent } from '@/interfaces';

const mockToast = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };
vi.mock('@/lib/primevue', () => ({
  useToast: () => mockToast
}));

vi.mock('vue-i18n', () => ({
  // Used by the composable
  useI18n: () => ({ t: (key: string) => key }),
  // Used by helpers.ts
  createI18n: () => ({
    global: {
      t: (key: string) => key
    }
  })
}));

vi.mock('@/services', () => ({
  atsService: {
    createATSClient: vi.fn(),
    createATSEnquiry: vi.fn()
  },
  externalApiService: {
    searchOrgBook: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  }
}));

vi.mock('@/utils/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    findIdpConfig: vi.fn(),
    scrollToFirstError: vi.fn()
  };
});

function createMockFormRef(initialValues: GenericObject = {}): Ref<InstanceType<typeof Form> | null> {
  return ref({
    values: initialValues,
    setFieldValue: vi.fn(),
    resetForm: vi.fn()
  } as unknown as InstanceType<typeof Form>);
}

const defaultProject = { activityId: 'activity-1', applicationStatus: ApplicationStatus.IN_PROGRESS };

describe('useProjectFormNavigator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isCompleted', () => {
    it('returns true when application is COMPLETED', () => {
      const { isCompleted } = useProjectFormNavigator(
        createMockFormRef(),
        { ...defaultProject, applicationStatus: ApplicationStatus.COMPLETED },
        Initiative.HOUSING
      );
      expect(isCompleted.value).toBe(true);
    });

    it('returns false when application is IN_PROGRESS', () => {
      const { isCompleted } = useProjectFormNavigator(createMockFormRef(), defaultProject, Initiative.HOUSING);
      expect(isCompleted.value).toBe(false);
    });
  });

  describe('setBasicInfo', () => {
    it('sets all fields accurately on the form ref', () => {
      const mockForm = createMockFormRef();
      const { setBasicInfo } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      const mockContact: Contact = {
        contactId: 'c1',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123',
        email: 'test@test.com',
        contactApplicantRelationship: ProjectRelationship.OWNER,
        contactPreference: ContactPreference.EMAIL,
        userId: 'u1'
      };

      setBasicInfo(mockContact);

      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.contactId', 'c1');
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.firstName', 'John');
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.lastName', 'Doe');
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.phoneNumber', '123');
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.email', 'test@test.com');
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith(
        'contact.contactApplicantRelationship',
        ProjectRelationship.OWNER
      );
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.contactPreference', ContactPreference.EMAIL);
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.userId', 'u1');
    });

    it('handles undefined contact gracefully', () => {
      const mockForm = createMockFormRef();
      const { setBasicInfo } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      setBasicInfo();
      expect(mockForm.value?.setFieldValue).toHaveBeenCalledWith('contact.firstName', undefined);
    });
  });

  describe('onCancel', () => {
    it('resets form and handles message visibility timings', async () => {
      vi.useFakeTimers();

      const scrollIntoViewMock = vi.fn();
      const mockHtmlElement = { scrollIntoView: scrollIntoViewMock } as unknown as HTMLElement;
      vi.spyOn(document, 'getElementById').mockReturnValue(mockHtmlElement);

      const mockForm = createMockFormRef();
      const { onCancel, showCancelMessage } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      onCancel();

      expect(mockForm.value?.resetForm).toHaveBeenCalled();
      expect(showCancelMessage.value).toBe(true);

      vi.advanceTimersByTime(150);
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

      vi.advanceTimersByTime(6000);
      expect(showCancelMessage.value).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('onInvalidSubmit', () => {
    it('toasts a warning if firstName is missing and scrolls to error', () => {
      const { onInvalidSubmit } = useProjectFormNavigator(createMockFormRef(), defaultProject, Initiative.HOUSING);

      onInvalidSubmit({ errors: { 'contact.firstName': 'required', 'other.field': 'required' } });

      expect(mockToast.warn).toHaveBeenCalledWith('i.housing.project.projectForm.basicInfoMissing');
      expect(utils.scrollToFirstError).toHaveBeenCalledWith({
        'contact.firstName': 'required',
        'other.field': 'required'
      });
    });

    it('does not toast a warning if firstName is not in errors', () => {
      const { onInvalidSubmit } = useProjectFormNavigator(createMockFormRef(), defaultProject, Initiative.HOUSING);

      onInvalidSubmit({ errors: { 'other.field': 'required' } });

      expect(mockToast.warn).not.toHaveBeenCalled();
      expect(utils.scrollToFirstError).toHaveBeenCalled();
    });
  });

  describe('searchOrgBook', () => {
    it('ignores queries less than 2 characters', async () => {
      const { searchOrgBook, orgBookOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );
      await searchOrgBook('A');
      expect(externalApiService.searchOrgBook).not.toHaveBeenCalled();
      expect(orgBookOptions.value).toEqual([]);
    });

    it('searches and maps orgBook results correctly for Housing', async () => {
      vi.mocked(externalApiService.searchOrgBook).mockResolvedValueOnce(
        mockAxiosResponse({
          results: [
            { type: 'name', value: 'Zebra Corp', topic_source_id: 'Z1' },
            { type: 'person', value: 'Ignored', topic_source_id: 'I1' },
            { type: 'name', value: 'Apple Corp', topic_source_id: 'A1' }
          ]
        })
      );

      const { searchOrgBook, orgBookOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );
      await searchOrgBook('Corp');

      expect(orgBookOptions.value).toEqual([
        { registeredName: 'Apple Corp', registeredId: 'A1' },
        { registeredName: 'Zebra Corp', registeredId: 'Z1' }
      ]);
    });

    it('adds BC Hydro manually for Electrification projects when queried', async () => {
      vi.mocked(externalApiService.searchOrgBook).mockResolvedValueOnce(mockAxiosResponse({ results: [] }));

      const { searchOrgBook, orgBookOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.ELECTRIFICATION
      );
      await searchOrgBook('HYDRO');

      expect(orgBookOptions.value).toEqual([{ registeredName: 'BC HYDRO AND POWER AUTHORITY', registeredId: '' }]);
    });

    it('handles undefined results from searchOrgBook gracefully (nullish coalescing)', async () => {
      vi.mocked(externalApiService.searchOrgBook).mockResolvedValueOnce(mockAxiosResponse({}));

      const { searchOrgBook, orgBookOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );
      await searchOrgBook('Corp');

      expect(orgBookOptions.value).toEqual([]);
    });
  });

  describe('onAssigneeInput', () => {
    it('does nothing if idp config is missing', async () => {
      vi.mocked(utils.findIdpConfig).mockReturnValueOnce(undefined);
      const { onAssigneeInput, assigneeOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );

      const mockEvent = { target: { value: 'test' } as HTMLInputElement } as unknown as IInputEvent;
      await onAssigneeInput(mockEvent);

      expect(userService.searchUsers).not.toHaveBeenCalled();
      expect(assigneeOptions.value).toEqual([]);
    });

    it('searches by email regex if input is a valid email', async () => {
      vi.mocked(utils.findIdpConfig).mockReturnValueOnce({ idp: 'idir' } as ReturnType<typeof utils.findIdpConfig>);
      vi.mocked(userService.searchUsers).mockResolvedValueOnce(mockAxiosResponse([{ fullName: 'Regex User' } as User]));

      const { onAssigneeInput, assigneeOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );

      const mockEvent = { target: { value: 'test@test.com' } as HTMLInputElement } as unknown as IInputEvent;
      await onAssigneeInput(mockEvent);

      expect(userService.searchUsers).toHaveBeenCalledWith({ email: 'test@test.com', idp: ['idir'] });
      expect(assigneeOptions.value).toEqual([{ fullName: 'Regex User' }]);
    });

    it('searches by name/email if length exceeds MIN_SEARCH_INPUT_LENGTH', async () => {
      vi.mocked(utils.findIdpConfig).mockReturnValueOnce({ idp: 'idir' } as ReturnType<typeof utils.findIdpConfig>);
      vi.mocked(userService.searchUsers).mockResolvedValueOnce(mockAxiosResponse([{ fullName: 'Test' } as User]));

      const { onAssigneeInput, assigneeOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );

      const longString = 'a'.repeat(MIN_SEARCH_INPUT_LENGTH + 1);
      const mockEvent = { target: { value: longString } as HTMLInputElement } as unknown as IInputEvent;
      await onAssigneeInput(mockEvent);

      expect(userService.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({ email: expect.any(String), fullName: expect.any(String) })
      );
      expect(assigneeOptions.value).toEqual([{ fullName: 'Test' }]);
    });

    it('clears options if no criteria matches', async () => {
      vi.mocked(utils.findIdpConfig).mockReturnValueOnce({ idp: 'idir' } as ReturnType<typeof utils.findIdpConfig>);
      const { onAssigneeInput, assigneeOptions } = useProjectFormNavigator(
        createMockFormRef(),
        defaultProject,
        Initiative.HOUSING
      );

      assigneeOptions.value = [{ fullName: 'Old' } as User];

      const mockEvent = { target: { value: 'a' } as HTMLInputElement } as unknown as IInputEvent;
      await onAssigneeInput(mockEvent);

      expect(userService.searchUsers).not.toHaveBeenCalled();
      expect(assigneeOptions.value).toEqual([]);
    });
  });

  describe('handleAtsCreate & ATS Endpoints', () => {
    const mockValues: GenericObject = {
      contact: { phoneNumber: '1', email: '2', firstName: '3', lastName: '4' },
      project: { projectName: 'P1' }
    };

    it('creates client AND enquiry on CLIENT_ENQUIRY type (Success)', async () => {
      vi.mocked(atsService.createATSClient).mockResolvedValueOnce(mockAxiosResponse({ clientId: 99 }, 201));
      vi.mocked(atsService.createATSEnquiry).mockResolvedValueOnce(mockAxiosResponse({ enquiryId: 88 }, 201));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT_ENQUIRY;
      const submissionValues: GenericObject = { ...mockValues };

      await handleAtsCreate(submissionValues);

      expect(mockToast.success).toHaveBeenCalledWith('i.housing.project.projectForm.atsClientEnquiryPushed');
      expect(mockToast.success).toHaveBeenCalledTimes(1);

      expect(submissionValues.atsClientId).toBe(99);
      expect(submissionValues.atsEnquiryId).toBe(88);
      expect(submissionValues.addedToAts).toBe(true);
      expect(atsCreateType.value).toBe(undefined);
    });

    it('handles CLIENT_ENQUIRY where client succeeds but enquiry fails', async () => {
      vi.mocked(atsService.createATSClient).mockResolvedValueOnce(mockAxiosResponse({ clientId: 99 }, 201));
      vi.mocked(atsService.createATSEnquiry).mockRejectedValueOnce(new Error('API Down'));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT_ENQUIRY;
      const submissionValues: GenericObject = { ...mockValues };

      await handleAtsCreate(submissionValues);

      expect(mockToast.success).toHaveBeenCalledWith('i.housing.project.projectForm.atsClientPushed');
      expect(mockToast.error).toHaveBeenCalledWith('i.housing.project.projectForm.atsEnquiryPushError Error: API Down');
    });

    it('handles CLIENT_ENQUIRY where client fails', async () => {
      vi.mocked(atsService.createATSClient).mockRejectedValueOnce(new Error('Client API Down'));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT_ENQUIRY;
      const submissionValues: GenericObject = { ...mockValues };

      await handleAtsCreate(submissionValues);

      expect(mockToast.error).toHaveBeenCalledWith(
        'i.housing.project.projectForm.atsClientPushError Error: Client API Down'
      );
      expect(atsService.createATSEnquiry).not.toHaveBeenCalled();
    });

    it('creates ENQUIRY only on ENQUIRY type (Success)', async () => {
      vi.mocked(atsService.createATSEnquiry).mockResolvedValueOnce(mockAxiosResponse({ enquiryId: 88 }, 201));

      const mockForm = createMockFormRef({ ...mockValues, atsClientId: 99 });
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.ENQUIRY;
      const submissionValues: GenericObject = { ...mockValues };

      await handleAtsCreate(submissionValues);

      expect(mockToast.success).toHaveBeenCalledWith('i.housing.project.projectForm.atsEnquiryPushed');
      expect(submissionValues.atsEnquiryId).toBe(88);
      expect(submissionValues.addedToAts).toBe(true);
    });

    it('creates CLIENT only on CLIENT type (Success)', async () => {
      vi.mocked(atsService.createATSClient).mockResolvedValueOnce(mockAxiosResponse({ clientId: 99 }, 201));

      const mockForm = createMockFormRef({ ...mockValues, atsEnquiryId: 88 });
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT;
      const submissionValues: GenericObject = { ...mockValues, atsEnquiryId: 88 };

      await handleAtsCreate(submissionValues);

      expect(mockToast.success).toHaveBeenCalledWith('i.housing.project.projectForm.atsClientPushed');
      expect(submissionValues.atsClientId).toBe(99);
      expect(submissionValues.addedToAts).toBe(true);
    });

    it('handles missing contact phone and email (nullish coalescing)', async () => {
      vi.mocked(atsService.createATSClient).mockResolvedValueOnce(mockAxiosResponse({ clientId: 99 }, 201));

      const emptyContactValues: GenericObject = {
        contact: { firstName: '3', lastName: '4' },
        project: { projectName: 'P1' }
      };

      const mockForm = createMockFormRef(emptyContactValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT;
      const submissionValues: GenericObject = { ...emptyContactValues };

      await handleAtsCreate(submissionValues);

      expect(atsService.createATSClient).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.objectContaining({ primaryPhone: null, email: null })
        })
      );

      expect(submissionValues.addedToAts).toBeUndefined();
    });

    it('bypasses addedToAts when ENQUIRY creation returns no ID', async () => {
      vi.mocked(atsService.createATSEnquiry).mockResolvedValueOnce(mockAxiosResponse({}, 201));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.ENQUIRY;
      const submissionValues: GenericObject = { ...mockValues };

      await handleAtsCreate(submissionValues);

      expect(submissionValues.addedToAts).toBeUndefined();
    });

    it('does nothing if createATSClient returns non-201 status', async () => {
      vi.mocked(atsService.createATSClient).mockResolvedValueOnce(mockAxiosResponse({}, 400));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.CLIENT;
      await handleAtsCreate({ ...mockValues });

      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it('does nothing if createATSEnquiry returns non-201 status', async () => {
      vi.mocked(atsService.createATSEnquiry).mockResolvedValueOnce(mockAxiosResponse({}, 400));

      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = ATSCreateTypes.ENQUIRY;
      await handleAtsCreate({ ...mockValues });

      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it('does nothing if atsCreateType is unrecognized', async () => {
      const mockForm = createMockFormRef(mockValues);
      const { handleAtsCreate, atsCreateType } = useProjectFormNavigator(mockForm, defaultProject, Initiative.HOUSING);

      atsCreateType.value = 'UNKNOWN_TYPE' as ATSCreateTypes;
      await handleAtsCreate({ ...mockValues });

      expect(atsService.createATSClient).not.toHaveBeenCalled();
      expect(atsService.createATSEnquiry).not.toHaveBeenCalled();
    });
  });
});
