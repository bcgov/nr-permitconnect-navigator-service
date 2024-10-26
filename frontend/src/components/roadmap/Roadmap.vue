<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref, watchEffect } from 'vue';
import { array, object, string } from 'yup';

import FileSelectModal from '@/components/file/FileSelectModal.vue';
import { InputText, TextArea } from '@/components/form';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { roadmapService, userService } from '@/services';
import { useConfigStore, useSubmissionStore, useTypeStore } from '@/store';
import { PermitNeeded, PermitStatus } from '@/utils/enums/housing';
import { roadmapTemplate } from '@/utils/templates';
import { delimitEmails, setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
const { activityId, editable = true } = defineProps<{
  activityId: string;
  editable?: boolean;
}>();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const typeStore = useTypeStore();
const { getDocuments, getPermits, getSubmission } = storeToRefs(useSubmissionStore());
const { getPermitTypes } = storeToRefs(typeStore);

// State
const fileSelectModalVisible: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any> = ref();
const selectedFiles: Ref<Array<Document>> = ref([]);

// Form schema
const emailValidator = (min: number, message: string) => {
  return array()
    .transform(function (value, originalValue) {
      if (this.isType(value) && value !== null) {
        return value;
      }
      return originalValue ? delimitEmails(originalValue) : [];
    })
    .min(min, message)
    .of(
      string()
        .trim()
        .email(({ value }) => `${value} is not a valid email`)
    );
};

const formSchema = object({
  to: emailValidator(1, 'To is required'),
  cc: emailValidator(0, 'CC is not required'),
  bcc: emailValidator(1, 'BCC is required'),
  subject: string().required(),
  body: string().required()
});

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmSubmit = (data: any) => {
  confirm.require({
    message: 'Please confirm that you want to send this Permit Roadmap. This cannot be undone.',
    header: 'Confirm sending this Permit Roadmap',
    acceptLabel: 'Send',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        await roadmapService.send(
          activityId,
          selectedFiles.value.map((x: Document) => x.documentId),
          setEmptyStringsToNull(data)
        );
        toast.success('Roadmap sent');
      } catch (e: any) {
        toast.error('Failed to send roadmap', e?.response?.statusText);
      }
    }
  });
};

function getPermitTypeNamesByStatus(status: string) {
  return getPermits.value
    .map((p) => getPermitTypes.value.find((pt) => pt.permitTypeId === p.permitTypeId && p.status === status)?.name)
    .filter((pt) => !!pt)
    .map((name) => name as string);
}

function getPermitTypeNamesByNeeded(needed: string) {
  return getPermits.value
    .map((p) => getPermitTypes.value.find((pt) => pt.permitTypeId === p.permitTypeId && p.needed === needed)?.name)
    .filter((pt) => !!pt)
    .map((name) => name as string);
}

function onFileRemove(document: Document) {
  selectedFiles.value = selectedFiles.value.filter((x) => x.documentId !== document.documentId);
}

function onFileSelect(data: Array<Document>) {
  selectedFiles.value = data;
}

watchEffect(async () => {
  // Dumb, but need to do something with the ref for it to be watched properly
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const permits = getPermits.value.concat();
  const submission = getSubmission.value;

  // Get navigator details
  const configBCC = getConfig.value.ches?.roadmap?.bcc;
  let bcc = configBCC;
  let navigator = {
    email: configBCC ?? '',
    fullName: 'Permit Connect Navigator Service'
  };

  if (submission?.assignedUserId) {
    const assignee = (await userService.searchUsers({ userId: [submission.assignedUserId] })).data[0];

    if (assignee) {
      navigator = assignee;
      navigator.fullName = `${assignee.firstName} ${assignee.lastName}`;
      bcc = (bcc ? `${bcc}; ` : '') + assignee.email;
    }
  }

  // Permits
  const permitStateNew = getPermitTypeNamesByStatus(PermitStatus.NEW).filter((value) =>
    getPermitTypeNamesByNeeded(PermitNeeded.YES).includes(value)
  );
  const permitPossiblyNeeded = getPermitTypeNamesByStatus(PermitStatus.NEW).filter((value) =>
    getPermitTypeNamesByNeeded(PermitNeeded.UNDER_INVESTIGATION).includes(value)
  );
  const permitStateApplied = getPermitTypeNamesByStatus(PermitStatus.APPLIED);
  const permitStateCompleted = getPermitTypeNamesByStatus(PermitStatus.COMPLETED);

  const body = roadmapTemplate({
    '{{ contactName }}':
      submission?.contactFirstName && submission?.contactLastName
        ? `${submission?.contactFirstName} ${submission?.contactLastName}`
        : '',
    '{{ locationAddress }}': submission?.streetAddress ?? '',
    '{{ permitStateNew }}': permitStateNew,
    '{{ permitPossiblyNeeded }}': permitPossiblyNeeded,
    '{{ permitStateApplied }}': permitStateApplied,
    '{{ permitStateCompleted }}': permitStateCompleted,
    '{{ navigatorName }}': navigator.fullName
  });

  // Initial form values
  initialFormValues.value = {
    from: navigator.email,
    to: submission?.contactEmail,
    cc: undefined,
    bcc: bcc,
    subject: "Here is your housing project's Permit Roadmap", // eslint-disable-line quotes
    bodyType: 'text',
    body: body
  };

  formRef.value?.setFieldValue('from', navigator.email);
  formRef.value?.setFieldValue('to', submission?.contactEmail);
  formRef.value?.setFieldValue('bcc', bcc);
  formRef.value?.setFieldValue('body', body);
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="confirmSubmit"
  >
    <div class="formgrid grid">
      <InputText
        class="col-12 lg:col-6"
        name="to"
        label="To"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="cc"
        label="CC"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="bcc"
        label="BCC"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="subject"
        label="Subject"
        :disabled="!editable"
      />
      <div class="col" />
      <TextArea
        class="col-12"
        name="body"
        label="Note"
        :rows="10"
        :disabled="!editable"
      />
      <div class="col-12"><label class="font-bold">Add attachments</label></div>
      <div class="col-12 pt-2">
        <Button
          :disabled="!editable"
          @click="fileSelectModalVisible = true"
        >
          <font-awesome-icon
            icon="fa-solid fa-plus"
            class="mr-1"
          />
          Choose
        </Button>
        <div
          v-for="(document, index) in selectedFiles"
          :key="document.documentId"
          :index="index"
          class="mt-1"
        >
          <div class="flex align-items-center">
            <div>
              <Button
                class="p-button-sm p-button-outlined p-button-danger p-1 mr-1"
                @click="onFileRemove(document)"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </Button>
            </div>
            <div>{{ document.filename }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 pt-5">
        <Button
          label="Send"
          type="submit"
          icon="pi pi-envelope"
          :disabled="!editable"
        />
      </div>
    </div>
  </Form>

  <FileSelectModal
    v-model:visible="fileSelectModalVisible"
    :documents="getDocuments"
    :selected-documents="selectedFiles.slice()"
    @file-select:submit="onFileSelect"
  />
</template>
