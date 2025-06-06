<script setup lang="ts">
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
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  CONTACT_PREFERENCE_LIST,
  ENQUIRY_SUBMITTED_METHOD,
  ENQUIRY_TYPE_LIST,
  INTAKE_STATUS_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/projectCommon';
import { IdentityProviderKind, Regex } from '@/utils/enums/application';
import { ApplicationStatus, EnquirySubmittedMethod, IntakeStatus } from '@/utils/enums/projectCommon';
import { projectServiceKey } from '@/utils/keys';
import { findIdpConfig, omit, setEmptyStringsToNull } from '@/utils/utils';
import { atsClientIdValidator, contactValidator } from '@/validators';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { ATSClientResource, Enquiry, User } from '@/types';

// Interfaces
interface EnquiryForm extends Enquiry {
  user?: User;
}

// Props
const {
  relatedAtsNumber,
  editable = true,
  enquiry
} = defineProps<{
  relatedAtsNumber?: number | null;
  editable?: boolean;
  enquiry: any;
}>();

// Injections
const projectService = inject(projectServiceKey);

// Emit
const emit = defineEmits(['enquiryForm:saved']);

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const atsUserCreateModalVisible: Ref<boolean> = ref(false);
const atsUserDetailsModalVisible: Ref<boolean> = ref(false);
const atsUserLinkModalVisible: Ref<boolean> = ref(false);
const filteredProjectActivityIds: Ref<Array<string>> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const projectActivityIds: Ref<Array<string>> = ref([]);
const initialFormValues: Ref<any | undefined> = ref(undefined);
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
const enquiryStore = useEnquiryStore();
const toast = useToast();

const displayAtsNumber = computed(() => (values: Enquiry) => {
  if (values.relatedActivityId) return relatedAtsNumber || 'Unavailable';
  else return values.atsClientId;
});

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

const showUserLinkModelCheck = (values: Enquiry) => {
  return relatedAtsNumber || values.atsClientId;
};

const handleDetailsModalClick = (values: Enquiry) => {
  if (showUserLinkModelCheck(values)) atsUserDetailsModalVisible.value = true;
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

function onInvalidSubmit(e: any) {
  const errors = Object.keys(e.errors);

  // Scrolls to the top-most error
  let first: Element | null = null;

  for (let error of errors) {
    const el = document.querySelector(`[name="${error}"]`);
    const rect = el?.getBoundingClientRect();

    if (rect) {
      if (!first) first = el;
      else if (rect.top < first.getBoundingClientRect().top) first = el;
    }
  }

  first?.scrollIntoView({ behavior: 'smooth' });
}

function onRelatedActivityInput(e: IInputEvent) {
  filteredProjectActivityIds.value = projectActivityIds.value.filter((id) =>
    id.toUpperCase().includes(e.target.value.toUpperCase())
  );
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

const onSubmit = async (values: any) => {
  try {
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
        'contactPreference'
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
        contactId: submitData?.contacts[0].contactId,
        contactFirstName: submitData?.contacts[0].firstName,
        contactLastName: submitData?.contacts[0].lastName,
        contactPhoneNumber: submitData?.contacts[0].phoneNumber,
        contactEmail: submitData?.contacts[0].email,
        contactApplicantRelationship: submitData?.contacts[0].contactApplicantRelationship,
        contactPreference: submitData?.contacts[0].contactPreference,
        submittedAt: new Date(submitData.submittedAt),
        user: values.user
      }
    });
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
    submittedAt: new Date(enquiry?.submittedAt),
    addedToATS: enquiry?.addedToATS,
    atsClientId: enquiry?.atsClientId,
    user: assigneeOptions.value[0] ?? null
  };

  if (!projectService) throw new Error('No service');
  projectActivityIds.value = filteredProjectActivityIds.value = (await projectService.getActivityIds()).data;
});
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

      <InputText
        class="col-span-3"
        name="contactFirstName"
        label="First name"
        :disabled="!editable"
      />
      <InputText
        class="col-span-3"
        name="contactLastName"
        label="Last name"
        :disabled="!editable"
      />
      <Select
        class="col-span-3"
        name="contactApplicantRelationship"
        label="Relationship to activity"
        :disabled="!editable"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        class="col-span-3"
        name="contactPreference"
        label="Preferred contact method"
        :disabled="!editable"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        class="col-span-3"
        name="contactPhoneNumber"
        mask="(999) 999-9999"
        label="Phone number"
        :disabled="!editable"
      />
      <InputText
        class="col-span-3"
        name="contactEmail"
        label="Contact email"
        :disabled="!editable"
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
        <div class="col-start-1 col-span-12">
          <div class="flex items-center">
            <h5 class="mr-2">Client #</h5>
            <a
              :class="{
                'hover-hand': showUserLinkModelCheck(values as Enquiry),
                'no-underline': !showUserLinkModelCheck(values as Enquiry)
              }"
              @click="handleDetailsModalClick(values as Enquiry)"
            >
              {{ displayAtsNumber(values as Enquiry) }}
            </a>
          </div>
        </div>
        <input
          type="hidden"
          name="atsClientId"
        />
        <Button
          v-if="!values.atsClientId && !values.relatedActivityId"
          class="col-start-1 col-span-2"
          aria-label="Link to ATS"
          :disabled="!editable"
          @click="atsUserLinkModalVisible = true"
        >
          {{ t('enquiryForm.atsSearchBtn') }}
        </Button>
        <Button
          v-if="!values.atsClientId && !values.relatedActivityId"
          class="grid-col-start-3 col-span-2"
          aria-label="New ATS client"
          :disabled="!editable"
          @click="atsUserCreateModalVisible = true"
        >
          {{ t('enquiryForm.atsNewClientBtn') }}
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
      :project-or-enquiry="enquiry"
      @ats-user-link:link="
        (atsClientResource: ATSClientResource) => {
          atsUserLinkModalVisible = false;
          setFieldValue('atsClientId', atsClientResource.clientId);
        }
      "
    />
    <ATSUserDetailsModal
      v-model:visible="atsUserDetailsModalVisible"
      :ats-client-id="relatedAtsNumber || values.atsClientId"
      :disabled="!!values.relatedActivityId || !!relatedAtsNumber"
      @ats-user-details:un-link="
        () => {
          atsUserDetailsModalVisible = false;
          setFieldValue('atsClientId', null);
        }
      "
    />
    <ATSUserCreateModal
      v-model:visible="atsUserCreateModalVisible"
      :project-or-enquiry="enquiry"
      @ats-user-link:link="
        (atsClientId: string) => {
          atsUserCreateModalVisible = false;
          setFieldValue('atsClientId', atsClientId);
        }
      "
    />
  </Form>
</template>
