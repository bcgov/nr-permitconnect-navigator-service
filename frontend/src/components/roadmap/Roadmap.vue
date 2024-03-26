<script setup lang="ts">
import { Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { array, object, string } from 'yup';

import FileSelectModal from '@/components/file/FileSelectModal.vue';
import { InputText, TextArea } from '@/components/form';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { roadmapService, userService } from '@/services';
import { useConfigStore } from '@/store';
import { PERMIT_STATUS } from '@/utils/enums';
import { roadmapTemplate } from '@/utils/templates';

import type { Ref } from 'vue';
import type { Document, Permit, PermitType, Submission } from '@/types';
import { storeToRefs } from 'pinia';

// Props
type Props = {
  activityId: string;
  documents: Array<Document>;
  permits: Array<Permit>;
  permitTypes: Array<PermitType>;
  submission: Submission;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const fileSelectModalVisible: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any> = ref();
const selectedFiles: Ref<Array<Document>> = ref([]);

// Form schema
const emailValidator = array()
  .transform(function (value, originalValue) {
    if (this.isType(value) && value !== null) {
      return value;
    }
    return originalValue ? originalValue.split(/[\s,]+/) : [];
  })
  .of(string().email(({ value }) => `${value} is not a valid email`));

const formSchema = object({
  to: emailValidator,
  cc: emailValidator,
  bcc: emailValidator,
  subject: string().required(),
  body: string().required()
});

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmSubmit = (data: any) => {
  confirm.require({
    message: 'Please confirm that you want to send this roadmap. This cannot be undone.',
    header: 'Confirm sending this Roadmap',
    acceptLabel: 'Send',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        await roadmapService.send(props.activityId, data);
        toast.success('Roadmap sent');
      } catch (e: any) {
        toast.error('Failed to send roadmap', e.response.data);
      }
    }
  });
};

function getPermitTypeNamesByStatus(permits: Array<Permit>, permitTypes: Array<PermitType>, status: string) {
  return permits
    .map((p) => permitTypes.find((pt) => pt.permitTypeId === p.permitTypeId && p.status === status)?.name)
    .filter((pt) => !!pt)
    .map((name) => name as string);
}

function onFileRemove(document: Document) {
  selectedFiles.value = selectedFiles.value.filter((x) => x.documentId !== document.documentId);
}

function onFileSelect(data: Array<Document>) {
  selectedFiles.value = data;
  formRef.value?.setFieldValue(
    'attachments',
    data.map((x: Document) => ({ filename: x.filename, documentId: x.documentId }))
  );
}

onMounted(async () => {
  // get navigator details
  const configBCC = getConfig.value.ches?.bcc;
  let bcc = configBCC;
  let navigator = {
    email: configBCC,
    fullName: 'Permit Connect Navigator Service'
  };
  if (props.submission.assignedUserId) {
    const assignee = (await userService.searchUsers({ userId: [props.submission.assignedUserId] })).data[0];

    if (assignee) {
      navigator = assignee;
      navigator.fullName = `${assignee.firstName} ${assignee.lastName}`;
      bcc = `${bcc}, ${assignee.email}`;
    }
  }

  // Initial form values
  initialFormValues.value = {
    from: navigator.email,
    to: props.submission.contactEmail,
    cc: undefined,
    bcc: bcc,
    subject: "Here is your housing project's Permit Roadmap", // eslint-disable-line quotes
    bodyType: 'text',
    body: roadmapTemplate({
      '{{ contactName }}': props.submission.contactName ?? '',
      '{{ locationAddress }}': props.submission.streetAddress ?? '',
      '{{ permitStateNew }}': getPermitTypeNamesByStatus(props.permits, props.permitTypes, PERMIT_STATUS.NEW),
      '{{ permitStateApplied }}': getPermitTypeNamesByStatus(props.permits, props.permitTypes, PERMIT_STATUS.APPLIED),
      '{{ permitStateCompleted }}': getPermitTypeNamesByStatus(
        props.permits,
        props.permitTypes,
        PERMIT_STATUS.COMPLETED
      ),
      '{{ navigatorName }}': navigator.fullName
    })
  };
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
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="cc"
        label="CC"
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="bcc"
        label="BCC"
      />
      <div class="col" />
      <InputText
        class="col-12 lg:col-6"
        name="subject"
        label="Subject"
      />
      <div class="col" />
      <TextArea
        class="col-12"
        name="body"
        label="Note"
        :rows="10"
      />
      <div class="col-12"><label class="font-bold">Add attachments</label></div>
      <div class="col-12 pt-2">
        <Button @click="fileSelectModalVisible = true">
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
        />
      </div>
    </div>
  </Form>

  <FileSelectModal
    v-model:visible="fileSelectModalVisible"
    :documents="documents"
    :selected-documents="selectedFiles.slice()"
    @file-select:submit="onFileSelect"
  />
</template>
