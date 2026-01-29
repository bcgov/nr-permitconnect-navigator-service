<script setup lang="ts">
import { isAxiosError } from 'axios';
import { Form, type GenericObject } from 'vee-validate';
import { computed, inject, nextTick, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { boolean, date, mixed, object, string, type InferType } from 'yup';

import { CancelButton, EditableSelect, FormNavigationGuard, Select, TextArea } from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import ATSInfo from '@/components/ats/ATSInfo.vue';
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { activityContactService, atsService, contactService, enquiryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  ATS_MANAGING_REGION,
  CONTACT_PREFERENCE_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST,
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
import { ActivityContactRole, ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';
import { findIdpConfig, omit, scrollToFirstError, setEmptyStringsToNull } from '@/utils/utils';
import { atsClientIdValidator } from '@/validators';
import { emailValidator } from '@/validators/common';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type {
  ATSAddressResource,
  ATSClientResource,
  ATSEnquiryResource,
  Contact,
  DeepPartial,
  Enquiry,
  User
} from '@/types';

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

// Form validation schema
const intakeSchema = object({
  activityId: string(),
  enquiryId: string(),
  submittedBy: string(),
  submittedAt: date(),
  submissionType: string().oneOf(ENQUIRY_TYPE_LIST).label('Submission type'),
  relatedActivityId: string().nullable().min(0).max(255).label('Related submission'),
  submittedMethod: string().oneOf(ENQUIRY_SUBMITTED_METHOD).label('Submitted method'),
  contact: object({
    contactId: string(),
    email: emailValidator('Contact email must be valid').required().label('Contact email'),
    firstName: string().required().max(255).label('Contact first name'),
    lastName: string().max(255).label('Contact last name').nullable(),
    phoneNumber: string().required().label('Contact phone number'),
    contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project'),
    contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Preferred contact method'),
    userId: string()
  }),
  enquiryDescription: string().required().label('Enquiry detail'),
  user: mixed().nullable().label('Assigned to'),
  enquiryStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Activity state'),
  addedToAts: boolean().required().label('Authorized Tracking System (ATS) updated'),
  // ATS DDL: CLIENT_ID NUMBER(38,0) - may contain up to 38 digits
  atsClientId: atsClientIdValidator,
  atsEnquiryId: string().notRequired()
});

export type FormSchemaType = InferType<typeof intakeSchema>;

// Store
const enquiryStore = useEnquiryStore();

// State
const assigneeOptions: Ref<User[]> = ref([]);
const basicInfoManualEntry: Ref<boolean> = ref(false);
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const filteredProjectActivityIds: Ref<string[]> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const primaryContact = computed(
  () => enquiry?.activity?.activityContact?.find((x) => x.role === ActivityContactRole.PRIMARY)?.contact
);
const projectActivityIds: Ref<string[]> = ref([]);
const showCancelMessage: Ref<boolean> = ref(false);

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
      contactFirstName: formRef.value?.values.contact.firstName,
      contactSurname: formRef.value?.values.contact.lastName,
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

function onInvalidSubmit(e: GenericObject) {
  const errors = Object.keys(e.errors);

  if (errors.includes('contact.firstName')) {
    toast.warn(t('enquiryForm.basicInfoMissing'));
  }
  scrollToFirstError(e.errors);
}

function onRelatedActivityInput(e: IInputEvent) {
  filteredProjectActivityIds.value = projectActivityIds.value.filter((id) =>
    id.toUpperCase().includes(e.target.value.toUpperCase())
  );
  // Revert basic info to initial enquiry contact
  setBasicInfo(enquiry?.activity?.activityContact?.[0]?.contact);
}

async function getRelatedATSClientID(activityId: string) {
  if (projectService?.value) {
    const response = (await projectService.value.searchProjects({ activityId: [activityId] })).data;
    if (response.length > 0) {
      return response[0].atsClientId;
    }
  } else {
    throw new Error('No service');
  }
}

function onReOpen() {
  confirm.require({
    message: t('enquiryForm.confirmReopenMessage'),
    header: t('enquiryForm.confirmReopenHeader'),
    acceptLabel: t('enquiryForm.reopenAccept'),
    rejectLabel: t('enquiryForm.reopenReject'),
    rejectProps: { outlined: true },
    accept: () => {
      formRef.value?.setFieldValue('enquiryStatus', ApplicationStatus.IN_PROGRESS);
      if (formRef.value?.values) onSubmit(formRef.value?.values);
    }
  });
}

async function onRelatedActivityChange(e: SelectChangeEvent) {
  formRef.value?.setFieldValue('atsClientId', null);
  formRef.value?.setFieldValue('addedToAts', false);
  atsCreateType.value = undefined;

  if (e.value) {
    if (projectService?.value) {
      const response = (await projectService.value.searchProjects({ activityId: [e.value] })).data;
      if (response.length > 0) {
        // Set ATS client ID from the related project
        formRef.value?.setFieldValue('atsClientId', response[0].atsClientId);
        if (response[0].activity?.activityContact?.[0]?.contact)
          setBasicInfo(response[0].activity?.activityContact?.[0]?.contact);
      }
    } else {
      throw new Error('No service');
    }
  }
}

// Set basic info, clear it if no contact is provided
function setBasicInfo(contact?: Contact) {
  formRef.value?.setFieldValue('contact.contactId', contact?.contactId);
  formRef.value?.setFieldValue('contact.firstName', contact?.firstName);
  formRef.value?.setFieldValue('contact.lastName', contact?.lastName);
  formRef.value?.setFieldValue('contact.phoneNumber', contact?.phoneNumber);
  formRef.value?.setFieldValue('contact.email', contact?.email);
  formRef.value?.setFieldValue('contact.contactApplicantRelationship', contact?.contactApplicantRelationship);
  formRef.value?.setFieldValue('contact.contactPreference', contact?.contactPreference);
  formRef.value?.setFieldValue('contact.userId', contact?.userId);
  basicInfoManualEntry.value = false;
}

const onSubmit = async (values: GenericObject) => {
  try {
    // Create ATS data as necessary
    if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      values.atsEnquiryId = response?.atsEnquiryId;
      if (values.atsEnquiryId && values.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
      values.atsEnquiryId = await createATSEnquiry();
      if (values.atsEnquiryId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.CLIENT) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      if (values.atsEnquiryId && values.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    }

    // Omit all the fields we dont want to send
    const dataOmitted = omit({ ...values }, ['contact']);

    // Remove ATS client number from enquiry if submitted with linked activity
    if (dataOmitted.relatedActivityId) {
      dataOmitted.atsClientId = '';
      formRef?.value?.setFieldValue('atsClientId', null);
    }

    // Generate final enquiry object
    const submitData: Enquiry = omit(setEmptyStringsToNull(dataOmitted) as EnquiryForm, ['user']);
    submitData.assignedUserId = values.user?.userId ?? undefined;

    // Deal with Nav contact change nonsense
    // If the Nav adds a new contact then it is to be flagged as the new PRIMARY
    if (primaryContact.value?.contactId !== values.contact.contactId) {
      const newContact = (await contactService.updateContact(values.contact)).data;
      if (newContact.contactId) {
        await activityContactService.createActivityContact(
          enquiry.activityId,
          newContact.contactId,
          ActivityContactRole.PRIMARY
        );

        setBasicInfo(newContact);
      }
    }

    // Update enquiry
    const result = await enquiryService.updateEnquiry(values.enquiryId, submitData);
    enquiryStore.setEnquiry(result.data);

    // Wait a tick for store to propagate
    await nextTick();

    let atsClientId;
    if (submitData?.relatedActivityId) atsClientId = await getRelatedATSClientID(submitData?.relatedActivityId);

    formRef.value?.resetForm({
      values: {
        ...submitData,
        contact: {
          contactId: primaryContact.value?.contactId,
          firstName: primaryContact.value?.firstName,
          lastName: primaryContact.value?.lastName,
          phoneNumber: primaryContact.value?.phoneNumber,
          email: primaryContact.value?.email,
          contactApplicantRelationship: primaryContact.value?.contactApplicantRelationship,
          contactPreference: primaryContact.value?.contactPreference,
          userId: primaryContact.value?.userId
        },
        atsClientId: values.atsClientId || atsClientId,
        atsEnquiryId: values.atsEnquiryId,
        submittedAt: new Date(submitData.submittedAt),
        user: values.user
      }
    });

    basicInfoManualEntry.value = false;

    emit('enquiryForm:saved');

    toast.success(t('i.common.form.savedMessage'));
  } catch (e) {
    if (isAxiosError(e) || e instanceof Error) toast.error(t('enquiryForm.failedMessage'), e.message);
  }
};

onBeforeMount(async () => {
  if (enquiry?.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [enquiry.assignedUserId] })).data;
  }

  let atsClientId;
  if (enquiry?.relatedActivityId) atsClientId = await getRelatedATSClientID(enquiry?.relatedActivityId);

  initialFormValues.value = {
    activityId: enquiry?.activityId,
    enquiryId: enquiry?.enquiryId,
    submittedBy: enquiry?.submittedBy,

    submissionType: enquiry?.submissionType,
    submittedAt: new Date(enquiry?.submittedAt),
    relatedActivityId: enquiry?.relatedActivityId,
    submittedMethod: enquiry?.submittedMethod,
    enquiryDescription: enquiry?.enquiryDescription,
    contact: {
      contactId: primaryContact.value?.contactId,
      firstName: primaryContact.value?.firstName,
      lastName: primaryContact.value?.lastName,
      phoneNumber: primaryContact.value?.phoneNumber,
      email: primaryContact.value?.email,
      contactApplicantRelationship: primaryContact.value?.contactApplicantRelationship,
      contactPreference: primaryContact.value?.contactPreference,
      userId: primaryContact.value?.userId
    },

    addedToAts: enquiry?.addedToAts,
    atsClientId: enquiry?.atsClientId || atsClientId,
    atsEnquiryId: enquiry?.atsEnquiryId,

    user: assigneeOptions.value[0] ?? null,
    enquiryStatus: enquiry?.enquiryStatus
  };

  if (!projectService?.value) throw new Error('No service');
  projectActivityIds.value = filteredProjectActivityIds.value = (await projectService.value.getActivityIds()).data;
});

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
      if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY)
        atsEnquiryId = await createATSEnquiry(response.data.clientId);
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
    :initial-values="initialFormValues"
    :validation-schema="intakeSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="grid grid-cols-[4fr_1fr] gap-x-9 mt-4">
      <div class="flex flex-col gap-y-9">
        <div class="p-panel flex justify-between items-start px-6 py-4">
          <h2 class="section-header my-0">{{ values.contact.firstName }} {{ values.contact.lastName }}</h2>
          <div class="flex flex-col">
            <span>{{ t('enquiryForm.submissionDate') }}</span>
            <span class="text-[var(--p-bcblue-900)]">{{ formatDate(enquiry.submittedAt) }}</span>
          </div>
        </div>
        <ContactCardNavForm
          :editable="editable"
          :form-values="values"
          @contact-card-nav-form:pick="
            (contact: Contact) => {
              setBasicInfo(contact);
            }
          "
          @contact-card-nav-form:manual-entry="
            () => {
              setBasicInfo();
            }
          "
        />
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <h3 class="section-header m-0">
                {{ t('enquiryForm.enquiryDetailHeader') }}
              </h3>
            </div>
          </template>
          <TextArea
            name="enquiryDescription"
            label=""
            :disabled="!editable"
          />
        </Panel>
        <div class="flex mt-10">
          <Button
            v-if="!isCompleted"
            :label="t('enquiryForm.save')"
            type="submit"
            icon="pi pi-check"
            :disabled="!editable"
          />
          <CancelButton
            v-if="!isCompleted"
            :editable="editable"
            @clicked="onCancel"
          />
          <Button
            v-if="isCompleted"
            :label="t('enquiryForm.reopenSubmission')"
            icon="pi pi-check"
            @click="onReOpen()"
          />
        </div>
      </div>
      <div class="flex flex-col gap-y-9">
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('enquiryForm.relatedSubmission') }}
          </h4>
          <EditableSelect
            name="relatedActivityId"
            :disabled="!editable"
            :options="filteredProjectActivityIds"
            :get-option-label="(e: string) => e"
            @on-input="onRelatedActivityInput"
            @on-change="onRelatedActivityChange"
          />
        </div>
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('enquiryForm.submissionStateHeader') }}
          </h4>
          <div class="flex flex-col gap-y-4">
            <EditableSelect
              name="user"
              :label="t('enquiryForm.assignedTo')"
              :disabled="!editable"
              :options="assigneeOptions"
              :get-option-label="getAssigneeOptionLabel"
              @on-input="onAssigneeInput"
            />
            <EditableSelect
              name="submittedMethod"
              :label="t('enquiryForm.submittedMethod')"
              :disabled="!editable"
              :options="ENQUIRY_SUBMITTED_METHOD"
              :get-option-label="(e: string) => e"
            />

            <Select
              name="enquiryStatus"
              :label="t('enquiryForm.enquiryState')"
              :disabled="!editable"
              :options="APPLICATION_STATUS_LIST"
            />
            <Select
              name="submissionType"
              :label="t('enquiryForm.submissionType')"
              :disabled="!editable"
              :options="ENQUIRY_TYPE_LIST"
            />
          </div>
        </div>
        <ATSInfo
          :ats-client-id="values.atsClientId"
          :ats-enquiry-id="values.atsEnquiryId"
          :first-name="values.contact.firstName"
          :last-name="values.contact.lastName"
          :phone-number="values.contact.phoneNumber"
          :email="values.contact.email"
          :is-related-enquiry="!!values.relatedActivityId"
          @ats-info:set-client-id="(atsClientId: number | null) => setFieldValue('atsClientId', atsClientId)"
          @ats-info:set-added-to-ats="(addedToATS: boolean) => setFieldValue('addedToAts', addedToATS)"
          @ats-info:create="(value: ATSCreateTypes) => (atsCreateType = value)"
          @ats-info:create-enquiry="atsCreateType = ATSCreateTypes.ENQUIRY"
        />
      </div>
    </div>
  </Form>
</template>
