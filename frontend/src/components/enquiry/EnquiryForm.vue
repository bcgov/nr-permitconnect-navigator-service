<script setup lang="ts">
import { isAxiosError } from 'axios';
import { Form } from 'vee-validate';
import { computed, inject, nextTick, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { boolean, number, object, string, type InferType } from 'yup';

import { CancelButton, EditableSelect, FormNavigationGuard, TextArea } from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import SubmissionStateSection from '@/components/form/section/SubmissionStateSection.vue';
import ATSInfo from '@/components/ats/ATSInfo.vue';
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { atsService, enquiryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import {
  APPLICATION_STATUS_LIST,
  ATS_MANAGING_REGION,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { ATSCreateTypes, BasicResponse, GroupName, Initiative } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';
import { scrollToFirstError, setEmptyStringsToNull } from '@/utils/utils';
import { atsClientIdValidator } from '@/validators';
import { assignedToValidator } from '@/validators/common';

import type { SelectChangeEvent } from 'primevue/select';
import type { GenericObject } from 'vee-validate';
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
import { createContactCardNavFormSchema } from '@/validators/navigator';

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

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// Form validation schema
const enquiryFormSchema = object({
  ...createContactCardNavFormSchema({ t }),
  relatedActivityId: string().nullable().min(0).max(255).label('Related submission'),
  enquiryDescription: string().required().label('Enquiry detail'),
  addedToAts: boolean().required().label('Authorized Tracking System (ATS) updated'),
  atsInfo: object({
    atsClientId: atsClientIdValidator(t('validators.atsClientId.label')),
    atsEnquiryId: number().nullable()
  }),
  submissionState: object({
    submittedMethod: string().oneOf(ENQUIRY_SUBMITTED_METHOD).label('Submitted method'),
    submissionType: string().oneOf(ENQUIRY_TYPE_LIST).label('Submission type'),
    assignedUser: assignedToValidator(
      t('validators.submissionState.assignedToMsg'),
      t('validators.submissionState.assignedTo')
    ),
    enquiryStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Activity state')
  })
});

export type FormSchemaType = InferType<typeof enquiryFormSchema>;

// Store
const enquiryStore = useEnquiryStore();

// State
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
const isCompleted = computed(() => {
  return enquiry.enquiryStatus === ApplicationStatus.COMPLETED;
});

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
      enquiryPartnerAgencies: [atsEnquiryPartnerAgencies?.value ?? ''],
      enquiryMethodCodes: [Initiative.PCNS],
      notes: formRef.value?.values.enquiryDescription,
      enquiryTypeCodes: [atsEnquiryTypeCode?.value ?? '']
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
      formRef.value?.setFieldValue('submissionState.enquiryStatus', ApplicationStatus.IN_PROGRESS);
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
  if (!formRef.value) return;

  const updatedContact = {
    contactId: contact?.contactId,
    firstName: contact?.firstName,
    lastName: contact?.lastName,
    phoneNumber: contact?.phoneNumber,
    email: contact?.email,
    contactApplicantRelationship: contact?.contactApplicantRelationship,
    contactPreference: contact?.contactPreference,
    userId: contact?.userId
  };

  // Reset the entire contact object path to trigger reactivity and set the new baseline
  formRef.value.resetField('contact', { value: updatedContact });
}

const onSubmit = async (formValues: GenericObject) => {
  try {
    // vee-validate doesn't get transformed data from yup so
    // manually run the form values through it here
    const values: FormSchemaType = enquiryFormSchema.cast(formValues);

    // Create ATS data as necessary
    if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
      const response = await createATSClientEnquiry();
      values.atsInfo.atsClientId = response?.atsClientId;
      values.atsInfo.atsEnquiryId = response?.atsEnquiryId;
      if (values.atsInfo.atsEnquiryId && values.atsInfo.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
      values.atsInfo.atsEnquiryId = await createATSEnquiry();
      if (values.atsInfo.atsEnquiryId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.CLIENT) {
      const response = await createATSClientEnquiry();
      values.atsInfo.atsClientId = response?.atsClientId;
      if (values.atsInfo.atsEnquiryId && values.atsInfo.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    }

    // Generate final payload
    const payload: Partial<Enquiry> = {
      // Enquiry description
      enquiryDescription: values.enquiryDescription,

      // Related Activity
      relatedActivityId: values.relatedActivityId,

      // Submission State
      assignedUserId: values.submissionState.assignedUser ? (values.submissionState.assignedUser as User).userId : null,
      enquiryStatus: values.submissionState.enquiryStatus,
      submissionType: values.submissionState.submissionType,
      submittedMethod: values.submissionState.submittedMethod,

      // ATS
      // Remove ATS client number from enquiry if submitted with linked activity
      atsClientId: values.relatedActivityId ? null : values.atsInfo.atsClientId,
      atsEnquiryId: values.atsInfo.atsEnquiryId,
      addedToAts: !!(values.atsInfo.atsClientId || values.atsInfo.atsEnquiryId)
    };

    // Update enquiry
    const result = await enquiryService.updateEnquiry(enquiry.enquiryId, payload);
    enquiryStore.setEnquiry(result.data);

    // Wait a tick for store to propagate
    await nextTick();

    formRef.value?.resetForm({
      values: await initializeFormValues()
    });

    basicInfoManualEntry.value = false;

    emit('enquiryForm:saved');

    toast.success(t('i.common.form.savedMessage'));
  } catch (e) {
    if (isAxiosError(e) || e instanceof Error) toast.error(t('enquiryForm.failedMessage'), e.message);
  }
};

async function initializeFormValues(): Promise<DeepPartial<FormSchemaType>> {
  let assigneeOptions: User[] = [];
  if (enquiry?.assignedUserId) {
    assigneeOptions = (await userService.searchUsers({ userId: [enquiry.assignedUserId] })).data;
  }

  let atsClientId;
  if (enquiry?.relatedActivityId) atsClientId = await getRelatedATSClientID(enquiry?.relatedActivityId);

  return {
    relatedActivityId: enquiry?.relatedActivityId,
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

    submissionState: {
      assignedUser: assigneeOptions[0] ?? null,
      enquiryStatus: enquiry?.enquiryStatus,
      submittedMethod: enquiry?.submittedMethod,
      submissionType: enquiry?.submissionType
    },

    atsInfo: {
      atsClientId: enquiry?.atsClientId || atsClientId,
      atsEnquiryId: enquiry?.atsEnquiryId
    },

    addedToAts: enquiry?.addedToAts
  };
}

onBeforeMount(async () => {
  if (!projectService?.value) throw new Error('No service');
  projectActivityIds.value = filteredProjectActivityIds.value = (await projectService.value.getActivityIds()).data;

  initialFormValues.value = await initializeFormValues();
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
    :validation-schema="enquiryFormSchema"
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
        <SubmissionStateSection :is-enquiry="true" />
        <ATSInfo
          :ats-client-id="values.atsClientId"
          :ats-enquiry-id="values.atsEnquiryId"
          :first-name="values.contact.firstName"
          :last-name="values.contact.lastName"
          :phone-number="values.contact.phoneNumber"
          :email="values.contact.email"
          :is-related-enquiry="!!values.relatedActivityId"
          :is-enquiry="true"
          @ats-info:set-client-id="(atsClientId: number | null) => setFieldValue('atsClientId', atsClientId)"
          @ats-info:set-added-to-ats="(addedToATS: boolean) => setFieldValue('addedToAts', addedToATS)"
          @ats-info:create="(value: ATSCreateTypes) => (atsCreateType = value)"
          @ats-info:create-enquiry="atsCreateType = ATSCreateTypes.ENQUIRY"
        />
      </div>
    </div>
  </Form>
</template>
