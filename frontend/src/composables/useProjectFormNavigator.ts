import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form, type GenericObject } from 'vee-validate';

import { useToast } from '@/lib/primevue';
import { atsService, externalApiService, userService } from '@/services';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { BC_HYDRO_POWER_AUTHORITY } from '@/utils/constants/electrification';
import { ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX, ATS_MANAGING_REGION } from '@/utils/constants/projectCommon';
import {
  ATSCreateTypes,
  BasicResponse,
  GroupName,
  IdentityProviderKind,
  Initiative,
  Regex
} from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { findIdpConfig, scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { ATSAddressResource, ATSClientResource, ATSEnquiryResource, Contact, OrgBookOption, User } from '@/types';

export function useProjectFormNavigator(
  formRef: Ref<InstanceType<typeof Form> | null>,
  project: { activityId: string; applicationStatus: string },
  initiative: Initiative
) {
  const { t } = useI18n();
  const toast = useToast();

  // Shared State
  const assigneeOptions: Ref<User[]> = ref([]);
  const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
  const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
  const showCancelMessage: Ref<boolean> = ref(false);

  // Dynamic Constants based on Initiative
  const tPrefix = initiative === Initiative.HOUSING ? 'i.housing.project.projectForm' : 'i.electrification.projectForm';
  const ATS_ENQUIRY_TYPE_CODE = toTitleCase(initiative) + ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX;

  // Computed
  const isCompleted = computed(() => project.applicationStatus === ApplicationStatus.COMPLETED);

  // Actions
  async function createATSClientEnquiry() {
    try {
      const address: Partial<ATSAddressResource> = {
        '@type': 'AddressResource',
        primaryPhone: formRef.value?.values.contact.phoneNumber ?? '',
        email: formRef.value?.values?.contact.email ?? ''
      };

      const data = {
        '@type': 'ClientResource',
        address: address,
        firstName: formRef.value?.values.contact.firstName,
        surName: formRef.value?.values.contact.lastName,
        regionName: GroupName.NAVIGATOR,
        optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
      };

      const submitData: ATSClientResource = setEmptyStringsToNull(data);
      const response = await atsService.createATSClient(submitData);

      if (response.status === 201) {
        let atsEnquiryId = undefined;
        if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
          atsEnquiryId = await createATSEnquiry(response.data.clientId);
        }

        if (atsEnquiryId) toast.success(t(`${tPrefix}.atsClientEnquiryPushed`));
        else toast.success(t(`${tPrefix}.atsClientPushed`));

        return { atsClientId: response.data.clientId, atsEnquiryId: atsEnquiryId };
      }
    } catch (error) {
      toast.error(`${t(`${tPrefix}.atsClientPushError`)} ${error}`);
    }
  }

  async function createATSEnquiry(atsClientId?: number) {
    try {
      const ATSEnquiryData: ATSEnquiryResource = {
        '@type': 'EnquiryResource',
        clientId: (atsClientId as number) ?? formRef.value?.values.atsClientId,
        contactFirstName: formRef.value?.values.contact.firstName,
        contactSurname: formRef.value?.values.contact.lastName,
        regionName: ATS_MANAGING_REGION,
        subRegionalOffice: GroupName.NAVIGATOR,
        enquiryFileNumbers: [project.activityId],
        enquiryPartnerAgencies: [initiative],
        enquiryMethodCodes: [Initiative.PCNS],
        notes: formRef.value?.values.project.projectName,
        enquiryTypeCodes: [ATS_ENQUIRY_TYPE_CODE]
      };

      const response = await atsService.createATSEnquiry(ATSEnquiryData);
      if (response.status === 201) {
        if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
          toast.success(t(`${tPrefix}.atsEnquiryPushed`));
        }
        return response.data.enquiryId;
      }
    } catch (error) {
      toast.success(t(`${tPrefix}.atsClientPushed`));
      toast.error(`${t(`${tPrefix}.atsEnquiryPushError`)} ${error}`);
    }
  }

  async function handleAtsCreate(values: GenericObject) {
    if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      values.atsEnquiryId = response?.atsEnquiryId;
      if (values.atsEnquiryId && values.atsClientId) values.addedToAts = true;
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
      values.atsEnquiryId = await createATSEnquiry();
      if (values.atsEnquiryId) values.addedToAts = true;
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.CLIENT) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      if (values.atsEnquiryId && values.atsClientId) values.addedToAts = true;
      atsCreateType.value = undefined;
    }
  }

  const onAssigneeInput = async (e: IInputEvent) => {
    const input = e.target.value;
    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);

    if (idpCfg) {
      if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
        assigneeOptions.value = (
          await userService.searchUsers({ email: input, fullName: input, idp: [idpCfg.idp] })
        ).data;
      } else if (new RegExp(Regex.EMAIL).exec(input)) {
        assigneeOptions.value = (await userService.searchUsers({ email: input, idp: [idpCfg.idp] })).data;
      } else {
        assigneeOptions.value = [];
      }
    }
  };

  function onCancel() {
    formRef.value?.resetForm();
    showCancelMessage.value = true;

    setTimeout(() => {
      document.getElementById('cancelMessage')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setTimeout(() => {
      showCancelMessage.value = false;
    }, 6000);
  }

  function onInvalidSubmit(e: GenericObject) {
    const errors = Object.keys(e.errors);
    if (errors.includes('contact.firstName')) {
      toast.warn(t(`${tPrefix}.basicInfoMissing`));
    }
    scrollToFirstError(e.errors);
  }

  async function searchOrgBook(query: string) {
    if (query.length >= 2) {
      const results = (await externalApiService.searchOrgBook(query))?.data?.results ?? [];
      orgBookOptions.value = results
        .filter((obo: Record<string, string>) => obo.type === 'name')
        .map((obo: Record<string, string>) => ({
          registeredName: obo.value,
          registeredId: obo.topic_source_id
        }));

      // Electrification specific logic
      if (initiative === Initiative.ELECTRIFICATION && BC_HYDRO_POWER_AUTHORITY.includes(query.toUpperCase())) {
        orgBookOptions.value.push({
          registeredName: BC_HYDRO_POWER_AUTHORITY,
          registeredId: ''
        });
      }

      orgBookOptions.value.sort((a, b) => a.registeredName.localeCompare(b.registeredName));
    }
  }

  function setBasicInfo(contact?: Contact) {
    formRef.value?.setFieldValue('contact.contactId', contact?.contactId);
    formRef.value?.setFieldValue('contact.firstName', contact?.firstName);
    formRef.value?.setFieldValue('contact.lastName', contact?.lastName);
    formRef.value?.setFieldValue('contact.phoneNumber', contact?.phoneNumber);
    formRef.value?.setFieldValue('contact.email', contact?.email);
    formRef.value?.setFieldValue('contact.contactApplicantRelationship', contact?.contactApplicantRelationship);
    formRef.value?.setFieldValue('contact.contactPreference', contact?.contactPreference);
    formRef.value?.setFieldValue('contact.userId', contact?.userId);
  }

  return {
    assigneeOptions,
    atsCreateType,
    isCompleted,
    orgBookOptions,
    showCancelMessage,
    handleAtsCreate,
    onAssigneeInput,
    onCancel,
    onInvalidSubmit,
    searchOrgBook,
    setBasicInfo
  };
}
