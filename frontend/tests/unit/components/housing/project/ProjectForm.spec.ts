import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, externalApiService, mapService, userService, housingProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes, BasicResponse, GroupName } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { NumResidentialUnits } from '@/utils/enums/housing';
import { FORM_STUBS, mockAxiosError, mockAxiosResponse, t, VEE_FORM_STUB } from '../../../../helpers';

import type { GeoJSON } from 'geojson';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { SelectChangeEvent } from 'primevue/select';
import type { DefineComponent, ComponentPublicInstance } from 'vue';
import type { HousingProject, Group, GeocoderAddressResponse } from '@/types';
import type { VueWrapper } from '@vue/test-utils';

const mockRequire = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastWarn = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockRequire }),
    useToast: () => ({ success: mockToastSuccess, error: mockToastError, warn: mockToastWarn })
  };
});

vi.mock('@/services', () => ({
  atsService: {
    createATSClient: vi.fn(),
    createATSEnquiry: vi.fn()
  },
  externalApiService: {
    searchOrgBook: vi.fn(),
    searchAddressCoder: vi.fn()
  },
  mapService: {
    getPIDs: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  },
  housingProjectService: {
    updateProject: vi.fn()
  }
}));

const currentDate = new Date().toISOString();

const testUser = {
  active: true,
  email: 'john.doe@example.com',
  firstName: 'John',
  fullName: 'John Doe',
  idp: 'idir',
  lastName: 'Doe',
  groups: [{ groupId: 1, name: GroupName.DEVELOPER } as Group],
  status: 'active',
  userId: 'user123',
  sub: 'sub-123',
  elevatedRights: true,
  bceidBusinessName: '',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const testContact = {
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890',
  userId: 'user123'
};

const testGeoJson: GeoJSON = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} }]
};

const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'project789',
  projectId: 'project789',
  queuePriority: 1,
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiFamilyUnits: NumResidentialUnits.UNSURE,
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: NumResidentialUnits.UNSURE,
  hasRentalUnits: BasicResponse.YES,
  rentalUnits: '15',
  financiallySupportedBc: BasicResponse.YES,
  financiallySupportedIndigenous: BasicResponse.YES,
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: BasicResponse.YES,
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: BasicResponse.YES,
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPids: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: false,
  addedToAts: true,
  atsClientId: 654321,
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [testContact],
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  geoJson: testGeoJson
};

const emptyGeocoderResponse: GeocoderAddressResponse = {
  searchTimestamp: new Date(),
  executionTime: 10,
  version: '1.0',
  minScore: 0,
  maxResults: 10,
  echo: false,
  interpolation: 'none',
  outputSRS: 4326,
  setBack: 0,
  features: []
};

const mockSubmitValues = {
  project: { projectName: 'New Housing', companyIdRegistered: 'C1' },
  location: { naturalDisaster: BasicResponse.YES, streetAddress: '123 New St' },
  finance: { financiallySupportedBc: BasicResponse.YES },
  units: { singleFamilyUnits: '10' },
  submissionState: {
    queuePriority: 2,
    applicationStatus: ApplicationStatus.IN_PROGRESS,
    assignedUser: { userId: 'u1' }
  },
  contact: testContact,
  atsClientId: '111',
  atsEnquiryId: '222',
  addedToAts: false,
  consentToFeedback: BasicResponse.YES
};

const wrapperSettings = (testProjectProp = testProject, editableProp = true) => ({
  props: {
    project: testProjectProp,
    editable: editableProp
  },
  global: {
    plugins: [
      () => createTestingPinia({ initialState: { auth: { user: {} } } }),
      PrimeVue,
      ConfirmationService,
      i18n,
      ToastService
    ],
    directives: { tooltip: () => {} },
    stubs: {
      ATSInfo: true,
      ContactCardNavForm: true,
      Form: VEE_FORM_STUB,
      FormNavigationGuard: true,
      Message: { template: '<div class="stub-message"><slot /></div>' },
      'font-awesome-icon': true,
      'router-link': true,
      ...FORM_STUBS
    }
  }
});

describe('ProjectFormNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.searchUsers).mockResolvedValue(mockAxiosResponse([{ fullName: 'dummyName' }]));
    vi.mocked(mapService.getPIDs).mockResolvedValue(mockAxiosResponse({ pids: ['123456789'] }));

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Lifecycle & Initial Load', () => {
    it('renders the component with the provided props', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await nextTick();
      expect(wrapper).toBeTruthy();
    });

    it('searches for users and PIDs onMount', async () => {
      const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
      mount(ProjectForm, wrapperSettings(mountProject));
      await flushPromises();

      expect(userService.searchUsers).toHaveBeenCalledWith({ userId: [mountProject.assignedUserId] });
      expect(mapService.getPIDs).toHaveBeenCalledWith(testProject.housingProjectId);
    });

    it('disables all fields when editable is false', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings(testProject, false));
      await flushPromises();

      const inputs = wrapper.findAllComponents({ name: 'InputText' });
      expect(inputs.length).toBeGreaterThan(0);
      expect(inputs[0]?.props('disabled')).toBe(true);
    });
  });

  describe('DOM Interactions & Emits', () => {
    it('emits inputProjectName when project name changes', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const input = wrapper
        .findAllComponents({ name: 'InputText' })
        .find((c) => c.props('name') === 'project.projectName');

      await input?.vm.$emit('onInput', { target: { value: 'Updated Project' } });

      expect(wrapper.emitted('inputProjectName')).toBeTruthy();
    });

    it('handles cancel button click: shows message, scrolls, and auto-hides', async () => {
      vi.useFakeTimers();

      const mockScroll = vi.fn();
      vi.spyOn(document, 'getElementById').mockReturnValue({
        scrollIntoView: mockScroll
      } as unknown as HTMLElement);

      const activeProject = { ...testProject, applicationStatus: ApplicationStatus.IN_PROGRESS };
      const wrapper = mount(ProjectForm, wrapperSettings(activeProject));
      await flushPromises();

      const cancelBtn = wrapper.findComponent({ name: 'CancelButton' });
      await cancelBtn.vm.$emit('clicked');

      await nextTick();

      const message = wrapper.find('.stub-message');
      expect(message.exists()).toBe(true);
      expect(message.text()).toContain(t('i.common.form.cancelMessage'));

      vi.advanceTimersByTime(150);
      expect(mockScroll).toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(wrapper.find('.stub-message').exists()).toBe(true);

      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(wrapper.find('.stub-message').exists()).toBe(false);

      vi.useRealTimers();
    });

    it('handles reopen submission confirm flow', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings(testProject, true));
      await flushPromises();

      const reopenBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.props('label') === t('i.housing.project.projectForm.reopenSubmission'));
      await reopenBtn?.vm.$emit('click');

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(housingProjectService.updateProject).toHaveBeenCalled();
    });

    it('covers reopen submission without form values (fall-through)', async () => {
      const project = { ...testProject, applicationStatus: ApplicationStatus.COMPLETED };
      const wrapper = mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      const reopenBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.props('label') === t('i.housing.project.projectForm.reopenSubmission'));
      await reopenBtn?.vm.$emit('click');

      const confirmArgs = mockRequire.mock.calls[0]?.[0];

      wrapper.unmount();

      await confirmArgs.accept();

      expect(housingProjectService.updateProject).not.toHaveBeenCalled();
    });
  });

  describe('Address Search & GeoJSON', () => {
    it('searches address on input', async () => {
      vi.mocked(externalApiService.searchAddressCoder).mockResolvedValue(mockAxiosResponse(emptyGeocoderResponse));
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const editableSelect = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });

      await editableSelect.vm.$emit('onInput', { target: { value: '123 Main' } });
      await flushPromises();

      expect(externalApiService.searchAddressCoder).toHaveBeenCalledWith('123 Main');
    });

    it('clears location fields when address search is empty', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const editableSelect = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });

      await editableSelect.vm.$emit('onInput', { target: { value: '' } });
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(form.vm.values.location.streetAddress).toBeNull();
      expect(form.vm.values.location.locality).toBeNull();
      expect(form.vm.values.location.province).toBeNull();
    });

    it('sets address fields on address select', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const editableSelect = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });
      const mockEvent: SelectChangeEvent = {
        value: {
          properties: {
            civicNumber: '123',
            streetName: 'Main',
            streetType: 'St',
            localityName: 'City',
            provinceCode: 'BC'
          }
        },
        originalEvent: new Event('change')
      };

      await editableSelect.vm.$emit('onChange', mockEvent);
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(form.vm.values.location.streetAddress).toBe('123 Main St');
      expect(form.vm.values.location.locality).toBe('City');
      expect(form.vm.values.location.province).toBe('BC');
    });

    it('downloads geojson if exists using DOM-forward anchor click', async () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      const wrapper = mount(ProjectForm, wrapperSettings(testProject, false));
      await flushPromises();

      const downloadBtn = wrapper.find('#download-geojson');
      await downloadBtn.trigger('click');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();

      clickSpy.mockRestore();
    });
  });

  describe('onRegisteredNameInput & AutoComplete', () => {
    it('should searchOrgBook when query length is >= 2', async () => {
      vi.mocked(externalApiService.searchOrgBook).mockResolvedValue(mockAxiosResponse({ results: [] }));
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const event: AutoCompleteCompleteEvent = { query: 'Test', originalEvent: new Event('input') };
      const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });

      await autoComplete.vm.$emit('onComplete', event);

      expect(externalApiService.searchOrgBook).toHaveBeenCalledWith('Test');
    });
  });

  describe('Form Submission & Mapping', () => {
    beforeEach(() => {
      vi.mocked(housingProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
    });

    it('maps payload correctly, mapping boolean responses and omitting fields', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
        '.vee-form-stub'
      );
      form.vm.$emit('submit', { ...mockSubmitValues });
      await flushPromises();

      expect(housingProjectService.updateProject).toHaveBeenCalledWith(
        testProject.housingProjectId,
        expect.objectContaining({
          projectName: 'New Housing',
          companyIdRegistered: 'C1',
          queuePriority: 2,
          assignedUserId: 'u1',
          consentToFeedback: true,
          naturalDisaster: true,
          atsClientId: 111,
          atsEnquiryId: 222
        })
      );

      const updateCallArgs = vi.mocked(housingProjectService.updateProject).mock.calls[0]?.[1];
      expect(updateCallArgs).not.toHaveProperty('contact');
      expect(updateCallArgs).not.toHaveProperty('submissionState');
      expect(updateCallArgs).not.toHaveProperty('assignedUser');

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('handles submission errors with toast.error', async () => {
      vi.mocked(housingProjectService.updateProject).mockRejectedValue(mockAxiosError('Update failed'));

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
        '.vee-form-stub'
      );
      form.vm.$emit('submit', { ...mockSubmitValues });
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });
  });

  describe('Template Bindings & Edge Cases', () => {
    it('covers invalid-submit and triggers warning toast', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      // Trigger the @invalid-submit event.
      // Providing 'contact.firstName' error triggers the toast.warn branch in the logic.
      await form.vm.$emit('invalid-submit', {
        errors: { 'contact.firstName': 'Required' }
      });

      expect(mockToastWarn).toHaveBeenCalled();
    });
    it('covers Option Labels for Address, Assignee, and AutoComplete', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const addressSelect = wrapper
        .findAllComponents({ name: 'EditableSelect' })
        .find((c) => c.props('name') === 'addressSearch');
      expect(addressSelect?.props('getOptionLabel')({ properties: { fullAddress: '123 Main' } })).toBe('123 Main');
      expect(addressSelect?.props('getOptionLabel')({ properties: {} })).toBe('');

      const assigneeSelect = wrapper
        .findAllComponents({ name: 'EditableSelect' })
        .find((c) => c.props('name') === 'submissionState.assignedUser');
      expect(assigneeSelect?.props('getOptionLabel')({ fullName: 'Test User' })).toBe('Test User');

      const autoComplete = wrapper.findComponent({
        name: 'AutoComplete',
        props: { name: 'project.companyNameRegistered' }
      });
      expect(autoComplete.props('getOptionLabel')({ registeredName: 'Test Org' })).toBe('Test Org');
    });

    it('ignores address selection if value is falsy', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      form.vm.values.location.streetAddress = 'Initial';

      const editableSelect = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });
      await editableSelect.vm.$emit('onChange', { value: null, originalEvent: new Event('change') });
      await flushPromises();

      expect(form.vm.values.location.streetAddress).toBe('Initial');
    });

    it('returns early if originalEvent is InputEvent on address select', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      const editableSelect = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });

      const mockEvent = { originalEvent: new InputEvent('input'), value: { properties: { localityName: 'TestCity' } } };
      await editableSelect.vm.$emit('onChange', mockEvent);
      await flushPromises();

      expect(form.vm.values.location.locality).not.toBe('TestCity');
    });

    it('aborts geojson download if geojson is falsy', async () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      const customProject = { ...testProject, geoJson: undefined };
      const wrapper = mount(ProjectForm, wrapperSettings(customProject, false));
      await flushPromises();

      const downloadBtn = wrapper.find('#download-geojson');

      await downloadBtn.trigger('click');

      expect(clickSpy).not.toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('clears companyIdRegistered on AutoComplete change and sets on select', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      form.vm.values.project.companyIdRegistered = 'KeepMe';

      const autoComplete = wrapper.findComponent({
        name: 'AutoComplete',
        props: { name: 'project.companyNameRegistered' }
      });

      await autoComplete.vm.$emit('onChange');
      await flushPromises();
      expect(form.vm.values.project.companyIdRegistered).toBeNull();

      await autoComplete.vm.$emit('onSelect', { registeredId: 'RID-123', registeredName: 'Acme Corp' });
      await flushPromises();
      expect(form.vm.values.project.companyIdRegistered).toBe('RID-123');
      expect(form.vm.values.project.companyNameRegistered).toBe('Acme Corp');
    });

    it('updates location address field changes', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      form.vm.values.location = { streetAddress: '123 Main', locality: 'CityA', province: 'BC' };

      const streetInput = wrapper
        .findAllComponents({ name: 'InputText' })
        .find((c) => c.props('name') === 'location.streetAddress');
      await streetInput?.vm.$emit('onChange');

      const localityInput = wrapper
        .findAllComponents({ name: 'InputText' })
        .find((c) => c.props('name') === 'location.locality');
      await localityInput?.vm.$emit('onChange');

      const provinceInput = wrapper
        .findAllComponents({ name: 'InputText' })
        .find((c) => c.props('name') === 'location.province');
      await provinceInput?.vm.$emit('onChange');

      expect(form.vm.values.location.locationAddress).toBe('123 Main, CityA, BC');
    });

    it('covers false/nullish ternary branches for consent and disaster on mount', async () => {
      const customProject = { ...testProject, consentToFeedback: false, naturalDisaster: true };
      const wrapper = mount(ProjectForm, wrapperSettings(customProject));
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(form.props('initialValues').consentToFeedback).toBe(BasicResponse.NO);
      expect(form.props('initialValues').location.naturalDisaster).toBe(BasicResponse.YES);
    });

    it('covers NaN ID parsing and nullish companyId on submit', async () => {
      vi.mocked(housingProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      const fallbackSubmitValues = {
        ...mockSubmitValues,
        atsClientId: 'invalid',
        atsEnquiryId: 'invalid',
        project: { ...mockSubmitValues.project, companyIdRegistered: undefined }
      };

      await form.vm.$emit('submit', fallbackSubmitValues);
      await flushPromises();

      expect(housingProjectService.updateProject).toHaveBeenCalledWith(
        testProject.housingProjectId,
        expect.objectContaining({ atsClientId: null, atsEnquiryId: null, companyIdRegistered: null })
      );
    });

    it('covers standard Error instance branch on submit failure', async () => {
      vi.mocked(housingProjectService.updateProject).mockRejectedValue(new Error('Standard Error Message'));
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      await form.vm.$emit('submit', mockSubmitValues);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), 'Standard Error Message');
    });

    it('handles string throw on submit (non-Error branch)', async () => {
      vi.mocked(housingProjectService.updateProject).mockRejectedValue('String Error');
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      await form.vm.$emit('submit', mockSubmitValues);
      await flushPromises();

      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('covers ats-info explicit emits in template', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      await atsInfo.vm.$emit('ats-info:set-client-id', 999);
      await atsInfo.vm.$emit('ats-info:set-added-to-ats', true);

      await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);
      await form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 999, addedToAts: true });
      await flushPromises();
      expect(atsService.createATSClient).toHaveBeenCalled();

      await atsInfo.vm.$emit('ats-info:create-enquiry');
      await form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 999, addedToAts: true });
      await flushPromises();
      expect(atsService.createATSEnquiry).toHaveBeenCalled();
    });

    it('covers true and false branches for inline onChange clearing logic', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      const rentalSelect = wrapper
        .findAllComponents({ name: 'Select' })
        .find((c) => c.props('name') === 'units.hasRentalUnits');

      form.vm.values.units.rentalUnits = '15';
      await rentalSelect?.vm.$emit('onChange', { value: BasicResponse.YES });
      expect(form.vm.values.units.rentalUnits).toBe('15');

      await rentalSelect?.vm.$emit('onChange', { value: BasicResponse.NO });
      expect(form.vm.values.units.rentalUnits).toBeNull();

      const otherUnitsInput = wrapper
        .findAllComponents({ name: 'InputText' })
        .find((c) => c.props('name') === 'units.otherUnitsDescription');

      form.vm.values.units.otherUnits = '10';
      await otherUnitsInput?.vm.$emit('onChange', { target: { value: 'Some description' } });
      expect(form.vm.values.units.otherUnits).toBe('10');

      await otherUnitsInput?.vm.$emit('onChange', { target: { value: '' } });
      expect(form.vm.values.units.otherUnits).toBeNull();
      expect(form.vm.values.units.otherUnitsDescription).toBeNull();

      const npSelect = wrapper
        .findAllComponents({ name: 'Select' })
        .find((c) => c.props('name') === 'finance.financiallySupportedNonProfit');

      form.vm.values.finance.nonProfitDescription = 'NP Desc';
      await npSelect?.vm.$emit('onChange', { value: BasicResponse.YES });
      expect(form.vm.values.finance.nonProfitDescription).toBe('NP Desc');

      await npSelect?.vm.$emit('onChange', { value: BasicResponse.NO });
      expect(form.vm.values.finance.nonProfitDescription).toBeNull();

      const indSelect = wrapper
        .findAllComponents({ name: 'Select' })
        .find((c) => c.props('name') === 'finance.financiallySupportedIndigenous');

      form.vm.values.finance.indigenousDescription = 'Ind. Desc';
      await indSelect?.vm.$emit('onChange', { value: BasicResponse.YES });
      expect(form.vm.values.finance.indigenousDescription).toBe('Ind. Desc');

      await indSelect?.vm.$emit('onChange', { value: BasicResponse.NO });
      expect(form.vm.values.finance.indigenousDescription).toBeNull();

      const coopSelect = wrapper
        .findAllComponents({ name: 'Select' })
        .find((c) => c.props('name') === 'finance.financiallySupportedHousingCoop');

      form.vm.values.finance.housingCoopDescription = 'Coop Desc';
      await coopSelect?.vm.$emit('onChange', { value: BasicResponse.YES });
      expect(form.vm.values.finance.housingCoopDescription).toBe('Coop Desc');

      await coopSelect?.vm.$emit('onChange', { value: BasicResponse.NO });
      expect(form.vm.values.finance.housingCoopDescription).toBeNull();
    });
  });

  describe('Watchers', () => {
    it('updates form values passed to ContactCardNavForm when primaryContact changes in store', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const store = useProjectStore();
      store.activityContacts = [
        {
          contactId: 'new-contact-999',
          activityId: 'activity456',
          role: ActivityContactRole.PRIMARY,
          contact: { ...testContact, contactId: 'new-contact-999', firstName: 'Jane' }
        }
      ];

      await nextTick();
      await flushPromises();

      const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
      const passedFormValues = contactCard.props('formValues');

      expect(passedFormValues.contact.contactId).toBe('new-contact-999');
      expect(passedFormValues.contact.firstName).toBe('Jane');
    });

    it('ignores watcher update if contactId is identical', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const store = useProjectStore();

      store.activityContacts = [
        {
          contactId: 'contact123',
          activityId: 'activity456',
          role: ActivityContactRole.PRIMARY,
          contact: { ...testContact, contactId: 'contact123', firstName: 'Jane' }
        }
      ];
      await nextTick();
      await flushPromises();

      store.activityContacts = [
        {
          contactId: 'contact123',
          activityId: 'activity456',
          role: ActivityContactRole.PRIMARY,
          contact: { ...testContact, contactId: 'contact123', firstName: 'Bob' }
        }
      ];
      await nextTick();
      await flushPromises();

      const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
      const passedFormValues = contactCard.props('formValues');

      expect(passedFormValues.contact.firstName).toBe('Jane');
    });
  });
});
