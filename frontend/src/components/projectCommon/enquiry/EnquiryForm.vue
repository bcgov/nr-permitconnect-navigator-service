<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { boolean, date, mixed, object, string } from 'yup';

import {
  CancelButton,
  Checkbox,
  DatePicker,
  EditableSelect,
  FormNavigationGuard,
  InputMask,
  InputText,
  Select,
  SectionHeader,
  TextArea
} from '@/components/form';
import ATSUserLinkModal from '@/components/user/ATSUserLinkModal.vue';
import ATSUserCreateModal from '@/components/user/ATSUserCreateModal.vue';
import ATSUserDetailsModal from '@/components/user/ATSUserDetailsModal.vue';
import ContactSearchModal from '@/components/contact/ContactSearchModal.vue';
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import { atsService, enquiryService, userService } from '@/services';
import { useAppStore, useEnquiryStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  ATS_MANAGING_REGION,
  CONTACT_PREFERENCE_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST,
  INTAKE_STATUS_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/projectCommon';
import {
  ATSCreateTypes,
  BasicResponse,
  GroupName,
  IdentityProviderKind,
  Initiative,
  Regex
} from '@/utils/enums/application';
import { ApplicationStatus, EnquirySubmittedMethod, IntakeStatus } from '@/utils/enums/projectCommon';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';
import { findIdpConfig, omit, scrollToFirstError, setEmptyStringsToNull } from '@/utils/utils';
import { atsClientIdValidator, contactValidator } from '@/validators';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { ATSAddressResource, ATSClientResource, ATSEnquiryResource, Contact, Enquiry, User } from '@/types';

// Interfaces
interface EnquiryForm extends Enquiry {
  user?: User;
}

// Props
const { editable = true, enquiry } = defineProps<{
  editable?: boolean;
  enquiry: Enquiry;
}>();

// Injections
const projectService = inject(projectServiceKey);
const atsEnquiryPartnerAgencies = inject(atsEnquiryPartnerAgenciesKey);
const atsEnquiryTypeCode = inject(atsEnquiryTypeCodeKey);

// Emit
const emit = defineEmits(['enquiryForm:saved']);

// Store
const appStore = useAppStore();
const enquiryStore = useEnquiryStore();
const { getInitiative } = storeToRefs(appStore);

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const atsUserCreateModalVisible: Ref<boolean> = ref(false);
const atsUserDetailsModalVisible: Ref<boolean> = ref(false);
const atsUserLinkModalVisible: Ref<boolean> = ref(false);
const basicInfoManualEntry: Ref<boolean> = ref(false);
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const filteredProjectActivityIds: Ref<Array<string>> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const projectActivityIds: Ref<Array<string>> = ref([]);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const searchContactModalVisible: Ref<boolean> = ref(false);
const showCancelMessage: Ref<boolean> = ref(false);

// Form validation schema
const intakeSchema = object({
  submissionType: string().oneOf(ENQUIRY_TYPE_LIST).label('Submission type'),
  submittedAt: date().required().label('Submission date'),
  relatedActivityId: string().nullable().min(0).max(255).label('Related submission'),
  submittedMethod: string().oneOf(ENQUIRY_SUBMITTED_METHOD).label('Submitted method'),
  ...contactValidator,
  enquiryDescription: string().required().label('Enquiry detail'),
  intakeStatus: string().oneOf(INTAKE_STATUS_LIST).label('Intake state'),
  user: mixed()
    .nullable()
    .when('intakeStatus', {
      is: (val: string) => val === IntakeStatus.SUBMITTED,
      then: (schema) =>
        schema
          .test('expect-user-or-empty', 'Assigned to must be empty or a selected user', (obj) => {
            if (obj == null || (obj as User)?.userId || (typeof obj == 'string' && obj.length === 0)) return true;
          })
          .nullable(),
      otherwise: (schema) =>
        schema.test('expect-user', 'Assigned to must be a selected user', (obj) => {
          return obj !== null && !!(obj as User)?.userId;
        })
    })
    .label('Assigned to'),
  applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Activity state'),
  waitingOn: string().notRequired().max(255).label('waiting on'),
  addedToATS: boolean().required().label('Authorized Tracking System (ATS) updated'),
  // ATS DDL: CLIENT_ID NUMBER(38,0) - may contain up to 38 digits
  atsClientId: atsClientIdValidator
});

// Actions
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName} [${e.email}]`;
};

const isCompleted = computed(() => {
  return enquiry.enquiryStatus === ApplicationStatus.COMPLETED;
});

const onAssigneeInput = async (e: IInputEvent) => {
  const input = e.target.value;

  const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);

  if (idpCfg) {
    if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
      assigneeOptions.value = (
        await userService.searchUsers({ email: input, fullName: input, idp: [idpCfg.idp] })
      ).data;
    } else if (input.match(Regex.EMAIL)) {
      assigneeOptions.value = (await userService.searchUsers({ email: input, idp: [idpCfg.idp] })).data;
    } else {
      assigneeOptions.value = [];
    }
  }
};

async function createATSEnquiry(atsClientId?: number) {
  try {
    const ATSEnquiryData: ATSEnquiryResource = {
      '@type': 'EnquiryResource',
      clientId: (atsClientId as number) ?? formRef.value?.values.atsClientId,
      contactFirstName: formRef.value?.values.contactFirstName,
      contactSurname: formRef.value?.values.contactLastName,
      regionName: ATS_MANAGING_REGION,
      subRegionalOffice: GroupName.NAVIGATOR,
      enquiryFileNumbers: [formRef.value?.values.activityId],
      enquiryPartnerAgencies: [atsEnquiryPartnerAgencies ?? ''],
      enquiryMethodCodes: [Initiative.PCNS],
      notes: formRef.value?.values.enquiryDescription,
      enquiryTypeCodes: [atsEnquiryTypeCode ?? '']
    };
    const response = await atsService.createATSEnquiry(ATSEnquiryData);
    if (response.status === 201) {
      if (atsCreateType.value === ATSCreateTypes.ENQUIRY) toast.success(t('enquiryForm.atsEnquiryPushed'));
      return response.data.enquiryId;
    }
  } catch (error) {
    toast.success(t('enquiryForm.atsClientPushed'));
    toast.error(t('enquiryForm.atsEnquiryPushError') + ' ' + error);
  }
}

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

function onInvalidSubmit(e: any) {
  scrollToFirstError(e.errors);
}

function onRelatedActivityInput(e: IInputEvent) {
  filteredProjectActivityIds.value = projectActivityIds.value.filter((id) =>
    id.toUpperCase().includes(e.target.value.toUpperCase())
  );
  // Revert basic info to initial enquiry contact
  setBasicInfo(enquiry?.contacts[0]);
}

async function getRelatedATSClientID(activityId: string) {
  formRef.value?.setFieldValue('atsClientId', null);
  if (projectService) {
    const response = (await projectService.searchProjects({ activityId: [activityId] })).data;
    if (response.length > 0) {
      formRef.value?.setFieldValue('atsClientId', response[0].atsClientId);
    }
  } else {
    throw new Error('No service');
  }
}

function onReOpen() {
  confirm.require({
    message: t('i.common.enquiryForm.confirmReopenMessage'),
    header: t('i.common.enquiryForm.confirmReopenHeader'),
    acceptLabel: t('i.common.enquiryForm.reopenAccept'),
    rejectLabel: t('i.common.enquiryForm.reopenReject'),
    rejectProps: { outlined: true },
    accept: () => {
      formRef.value?.setFieldValue('enquiryStatus', ApplicationStatus.IN_PROGRESS);
      onSubmit(formRef.value?.values);
    }
  });
}

async function onRelatedActivityChange(e: SelectChangeEvent) {
  formRef.value?.setFieldValue('atsClientId', null);
  formRef.value?.setFieldValue('atsEnquiryId', null);
  formRef.value?.setFieldValue('addedToATS', false);
  atsCreateType.value = undefined;

  if (e.value) {
    if (projectService) {
      const response = (await projectService.searchProjects({ activityId: [e?.value] })).data;
      if (response.length > 0) {
        // Set ATS client ID from the related project
        formRef.value?.setFieldValue('atsClientId', response[0].atsClientId);
        // Set basic info from the related activity contact
        if (getInitiative.value === Initiative.HOUSING) setBasicInfo(response[0].contacts[0]);
        // For other initiatives
        else setBasicInfo(response[0].activity?.activityContact?.[0]?.contact);
      }
    } else {
      throw new Error('No service');
    }
  }
}

// Set basic info, clear it if no contact is provided
function setBasicInfo(contact?: Contact) {
  formRef.value?.setFieldValue('contactId', contact?.contactId);
  formRef.value?.setFieldValue('contactFirstName', contact?.firstName);
  formRef.value?.setFieldValue('contactLastName', contact?.lastName);
  formRef.value?.setFieldValue('contactPhoneNumber', contact?.phoneNumber);
  formRef.value?.setFieldValue('contactEmail', contact?.email);
  formRef.value?.setFieldValue('contactApplicantRelationship', contact?.contactApplicantRelationship);
  formRef.value?.setFieldValue('contactPreference', contact?.contactPreference);
  formRef.value?.setFieldValue('contactUserId', contact?.userId);
  basicInfoManualEntry.value = false;
}

function onNewATSEnquiry() {
  confirm.require({
    message: t('enquiryForm.atsEnquiryConfirmMsg'),
    header: t('enquiryForm.atsEnquiryConfirmTitle'),
    acceptLabel: t('enquiryForm.confirm'),
    rejectLabel: t('enquiryForm.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      atsCreateType.value = ATSCreateTypes.ENQUIRY;
    }
  });
}

const onSubmit = async (values: any) => {
  try {
    if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      values.atsEnquiryId = response?.atsEnquiryId;
      if (values.atsEnquiryId && values.atsClientId) {
        values.addedToATS = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
      values.atsEnquiryId = await createATSEnquiry();
      if (values.atsEnquiryId) {
        values.addedToATS = true;
      }
      atsCreateType.value = undefined;
    }

    // Convert contact fields into contacts array object then remove form keys from data
    const valuesWithContact = omit(
      {
        ...values,
        atsClientId: parseInt(values.atsClientId) || '',
        contacts: [
          {
            contactId: values.contactId,
            firstName: values.contactFirstName,
            lastName: values.contactLastName,
            phoneNumber: values.contactPhoneNumber,
            email: values.contactEmail,
            contactApplicantRelationship: values.contactApplicantRelationship,
            contactPreference: values.contactPreference
          }
        ]
      },
      [
        'contactId',
        'contactFirstName',
        'contactLastName',
        'contactPhoneNumber',
        'contactEmail',
        'contactApplicantRelationship',
        'contactPreference',
        'contactUserId'
      ]
    );

    // Remove ats client number from enquiry if submitted
    // with linked activity
    if (valuesWithContact.relatedActivityId) {
      valuesWithContact.atsClientId = '';
      formRef?.value?.setFieldValue('atsClientId', null);
    }
    // Generate final enquiry object
    const submitData: Enquiry = omit(setEmptyStringsToNull(valuesWithContact) as EnquiryForm, ['user']);
    submitData.assignedUserId = values.user?.userId ?? undefined;
    const result = await enquiryService.updateEnquiry(values.enquiryId, submitData);
    enquiryStore.setEnquiry(result.data);
    formRef.value?.resetForm({
      values: {
        ...submitData,
        contactId: result.data?.contacts[0].contactId,
        contactFirstName: submitData?.contacts[0].firstName,
        contactLastName: submitData?.contacts[0].lastName,
        contactPhoneNumber: submitData?.contacts[0].phoneNumber,
        contactEmail: submitData?.contacts[0].email,
        contactApplicantRelationship: submitData?.contacts[0].contactApplicantRelationship,
        contactPreference: submitData?.contacts[0].contactPreference,
        contactUserId: result.data?.contacts[0].userId,
        submittedAt: new Date(submitData.submittedAt),
        user: values.user
      }
    });
    basicInfoManualEntry.value = false;
    if (submitData?.relatedActivityId) getRelatedATSClientID(submitData?.relatedActivityId);

    emit('enquiryForm:saved');

    toast.success(t('i.common.form.savedMessage'));
  } catch (e: any) {
    toast.error(t('enquiryForm.failedMessage'), e.message);
  }
};

onBeforeMount(async () => {
  if (enquiry?.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [enquiry.assignedUserId] })).data;
  }
  initialFormValues.value = {
    ...enquiry,
    contactId: enquiry?.contacts[0]?.contactId,
    contactFirstName: enquiry?.contacts[0]?.firstName,
    contactLastName: enquiry?.contacts[0]?.lastName,
    contactPhoneNumber: enquiry?.contacts[0]?.phoneNumber,
    contactEmail: enquiry?.contacts[0]?.email,
    contactApplicantRelationship: enquiry?.contacts[0]?.contactApplicantRelationship,
    contactPreference: enquiry?.contacts[0]?.contactPreference,
    contactUserId: enquiry?.contacts[0]?.userId,
    submittedAt: new Date(enquiry?.submittedAt),
    addedToATS: enquiry?.addedToATS,
    atsClientId: enquiry?.atsClientId,
    atsEnquiryId: enquiry?.atsEnquiryId,
    user: assigneeOptions.value[0] ?? null
  };

  if (enquiry?.relatedActivityId) getRelatedATSClientID(enquiry?.relatedActivityId);

  if (!projectService) throw new Error('No service');
  projectActivityIds.value = filteredProjectActivityIds.value = (await projectService.getActivityIds()).data;
});

async function createATSClientEnquiry() {
  try {
    const address: Partial<ATSAddressResource> = {
      '@type': 'AddressResource',
      primaryPhone: formRef.value?.values.contactPhoneNumber ?? '',
      email: formRef.value?.values?.contactEmail ?? ''
    };
    const data = {
      '@type': 'ClientResource',
      address: address,
      firstName: formRef.value?.values.contactFirstName,
      surName: formRef.value?.values.contactLastName,
      regionName: GroupName.NAVIGATOR,
      optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
    };

    const submitData: ATSClientResource = setEmptyStringsToNull(data);
    const response = await atsService.createATSClient(submitData);
    if (response.status === 201) {
      const atsEnquiryId = await createATSEnquiry(response.data.clientId);
      if (atsEnquiryId) toast.success(t('enquiryForm.atsClientEnquiryPushed'));
      else toast.success(t('enquiryForm.atsClientPushed'));
      return { atsClientId: response.data.clientId, atsEnquiryId: atsEnquiryId };
    }
  } catch (error) {
    toast.error(t('enquiryForm.atsClientPushError') + ' ' + error);
  }
}
</script>

<template>
  <Message
    v-if="showCancelMessage"
    id="cancelMessage"
    severity="warn"
    :closable="false"
    :life="5500"
  >
    {{ t('i.common.form.cancelMessage') }}
  </Message>
  <Form
    v-if="initialFormValues"
    v-slot="{ setFieldValue, values }"
    ref="formRef"
    :validation-schema="intakeSchema"
    :initial-values="initialFormValues"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="grid grid-cols-12 gap-4">
      <Select
        class="col-span-3"
        name="submissionType"
        label="Submission type"
        :disabled="!editable"
        :options="ENQUIRY_TYPE_LIST"
      />
      <DatePicker
        class="col-span-3"
        name="submittedAt"
        label="Submission date"
        :disabled="!editable"
      />
      <EditableSelect
        class="col-span-3"
        name="relatedActivityId"
        label="Related project"
        :disabled="!editable"
        :options="filteredProjectActivityIds"
        :get-option-label="(e: string) => e"
        @on-input="onRelatedActivityInput"
        @on-change="onRelatedActivityChange"
      />

      <EditableSelect
        class="col-span-3"
        name="submittedMethod"
        :label="t('enquiryForm.submittedMethod')"
        :disabled="!editable"
        :options="Object.values(EnquirySubmittedMethod)"
        :get-option-label="(e: string) => e"
      />
      <div class="col-span-3" />

      <SectionHeader :title="t('enquiryForm.basicInfoHeader')" />

      <Button
        v-if="!values.relatedActivityId"
        class="col-span-2"
        outlined
        aria-label="Search Contacts"
        :disabled="!editable"
        @click="searchContactModalVisible = true"
      >
        {{ t('enquiryForm.searchContacts') }}
      </Button>
      <div
        v-if="!values.contactUserId && values.contactId"
        class="col-span-12 mt-2"
      >
        <Message
          severity="warn"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryForm.manualContactHint') }}
        </Message>
      </div>

      <div
        v-if="values.contactId || basicInfoManualEntry || values.relatedActivityId"
        class="grid grid-cols-subgrid gap-4 col-span-12"
      >
        <InputText
          class="col-span-3"
          name="contactFirstName"
          label="First name"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <InputText
          class="col-span-3"
          name="contactLastName"
          label="Last name"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <Select
          class="col-span-3"
          name="contactApplicantRelationship"
          label="Relationship to activity"
          :disabled="!editable || !basicInfoManualEntry"
          :options="PROJECT_RELATIONSHIP_LIST"
        />
        <Select
          class="col-span-3"
          name="contactPreference"
          label="Preferred contact method"
          :disabled="!editable || !basicInfoManualEntry"
          :options="CONTACT_PREFERENCE_LIST"
        />
        <InputMask
          class="col-span-3"
          name="contactPhoneNumber"
          mask="(999) 999-9999"
          label="Phone number"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <InputText
          class="col-span-3"
          name="contactEmail"
          label="Contact email"
          :disabled="!editable || !basicInfoManualEntry"
        />
      </div>
      <ContactSearchModal
        v-model:visible="searchContactModalVisible"
        @contact-search:pick="
          (contact: Contact) => {
            searchContactModalVisible = false;
            setBasicInfo(contact);
            basicInfoManualEntry = false;
          }
        "
        @contact-search:manual-entry="
          () => {
            searchContactModalVisible = false;
            setBasicInfo();
            basicInfoManualEntry = true;
          }
        "
      />

      <SectionHeader :title="t('enquiryForm.enquiryDetailHeader')" />

      <TextArea
        class="col-span-12"
        name="enquiryDescription"
        label=""
        :disabled="!editable"
      />

      <SectionHeader :title="t('enquiryForm.atsHeader')" />

      <div class="grid grid-cols-subgrid gap-4 col-span-12">
        <div
          v-if="values.atsClientId || atsCreateType !== undefined"
          class="col-start-1 col-span-12"
        >
          <div class="col-start-1 col-span-12">
            <div class="flex items-center">
              <h5 class="mr-3">{{ t('enquiryForm.clientId') }}</h5>
              <a
                class="hover-hand"
                @click="atsUserDetailsModalVisible = true"
              >
                {{ values.atsClientId }}
              </a>
              <span v-if="atsCreateType === ATSCreateTypes.CLIENT_ENQUIRY">{{ t('enquiryForm.pendingSave') }}</span>
            </div>
          </div>
        </div>
        <input
          type="hidden"
          name="atsClientId"
        />
        <div
          v-if="values.atsEnquiryId || atsCreateType !== undefined"
          class="col-start-1 col-span-12"
        >
          <div class="flex items-center">
            <h5 class="mr-2">{{ t('enquiryForm.enquiry#') }}</h5>
            {{ values.atsEnquiryId }}
            <span v-if="atsCreateType !== undefined">
              {{ t('enquiryForm.pendingSave') }}
            </span>
          </div>
        </div>
        <input
          type="hidden"
          name="atsEnquiryId"
        />
        <Button
          v-if="!values.atsClientId && atsCreateType === undefined"
          class="col-start-1 col-span-2"
          outlined
          aria-label="Link to ATS"
          :disabled="!editable"
          @click="atsUserLinkModalVisible = true"
        >
          {{ t('enquiryForm.atsSearchBtn') }}
        </Button>
        <Button
          v-if="!values.atsClientId && atsCreateType === undefined"
          class="grid-col-start-3 col-span-2"
          outlined
          aria-label="New ATS client"
          :disabled="!editable"
          @click="atsUserCreateModalVisible = true"
        >
          {{ t('enquiryForm.atsNewClientBtn') }}
        </Button>
        <Button
          v-if="values.atsClientId && !values.atsEnquiryId && atsCreateType === undefined"
          class="grid-col-start-3 col-span-2"
          aria-label="New ATS enquiry"
          :disabled="!editable"
          @click="onNewATSEnquiry()"
        >
          {{ t('enquiryForm.atsNewEnquiryBtn') }}
        </Button>
      </div>
      <Checkbox
        class="col-span-12 mt-2"
        name="addedToATS"
        label="Authorized Tracking System (ATS) updated"
        :disabled="!editable"
        :bold="true"
      />
      <SectionHeader title="Submission state" />

      <Select
        class="col-span-3"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="INTAKE_STATUS_LIST"
      />
      <EditableSelect
        class="col-span-3"
        name="user"
        label="Assigned to"
        :disabled="!editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Select
        class="col-span-3"
        name="enquiryStatus"
        label="Activity state"
        :disabled="!editable"
        :options="APPLICATION_STATUS_LIST"
      />
      <InputText
        class="col-span-3"
        name="waitingOn"
        label="Waiting on"
        :disabled="!editable"
      />

      <div class="field col-span-12 mt-8">
        <Button
          v-if="!isCompleted"
          type="submit"
          icon="pi pi-check"
          :disabled="!editable"
          :label="t('enquiryForm.formSaveBtn')"
        />
        <CancelButton
          v-if="!isCompleted"
          :editable="editable"
          @clicked="onCancel"
        />
        <Button
          v-if="isCompleted"
          icon="pi pi-check"
          :label="t('enquiryForm.formReopenBtn')"
          @click="onReOpen()"
        />
      </div>
    </div>
    <ATSUserLinkModal
      v-model:visible="atsUserLinkModalVisible"
      :f-name="values.contactFirstName"
      :l-name="values.contactLastName"
      :phone-number="values.contactPhoneNumber"
      :email-id="values.contactEmail"
      @ats-user-link:link="
        (atsClientResource: ATSClientResource) => {
          atsUserLinkModalVisible = false;
          setFieldValue('atsClientId', atsClientResource.clientId);
          atsCreateType = ATSCreateTypes.ENQUIRY;
        }
      "
    />
    <ATSUserDetailsModal
      v-model:visible="atsUserDetailsModalVisible"
      :ats-client-id="values.atsClientId"
      :disabled="!!values.relatedActivityId"
      @ats-user-details:un-link="
        () => {
          atsUserDetailsModalVisible = false;
          setFieldValue('atsClientId', null);
          setFieldValue('atsEnquiryId', null);
          setFieldValue('addedToATS', false);
          atsCreateType = undefined;
        }
      "
    />
    <ATSUserCreateModal
      v-model:visible="atsUserCreateModalVisible"
      :first-name="values.contactFirstName"
      :last-name="values.contactLastName"
      :phone="values.contactPhoneNumber"
      :email="values.contactEmail"
      @ats-user-create:create="
        () => {
          atsUserCreateModalVisible = false;
          atsCreateType = ATSCreateTypes.CLIENT_ENQUIRY;
        }
      "
    />
  </Form>
</template>
