<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, type GenericObject } from 'vee-validate';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { array, object, string } from 'yup';

import FileSelectModal from '@/components/file/FileSelectModal.vue';
import { InputText, TextArea } from '@/components/form';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { roadmapService, userService } from '@/services';
import { useAppStore, useConfigStore, useProjectStore } from '@/store';
import { PermitNeeded, PermitStage } from '@/utils/enums/permit';
import { roadmapTemplate } from '@/utils/templates';
import { delimitEmails, setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Document } from '@/types';
import { isAxiosError } from 'axios';

// Props
const { activityId, editable = true } = defineProps<{
  activityId: string;
  editable?: boolean;
}>();

// Composables
const { t } = useI18n();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const { getDocuments, getPermits, getProject } = storeToRefs(useProjectStore());
const projectStore = useProjectStore();

// State
const fileSelectModalVisible: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any> = ref();
const selectedFiles: Ref<Document[]> = ref([]);

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

const confirmSubmit = (data: GenericObject) => {
  confirm.require({
    message: 'Please confirm that you want to send this Permit Roadmap. This cannot be undone.',
    header: 'Confirm sending this Permit Roadmap',
    acceptLabel: 'Send',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        const response = (
          await roadmapService.send(
            activityId,
            selectedFiles.value.map((x: Document) => x.documentId),
            setEmptyStringsToNull(data)
          )
        ).data;
        projectStore.addNoteHistory(response);
        toast.success('Roadmap sent');
      } catch (e) {
        if (isAxiosError(e)) toast.error('Failed to send roadmap', e?.response?.statusText);
        else toast.error('Failed to send roadmap', String(e));
      }
    }
  });
};

function getPermitTypeNamesByStatus(status: string): string[] {
  return getPermits.value
    .filter((p) => p.stage === status)
    .map((p) => p.permitType?.name)
    .filter(Boolean) as string[];
}

function getPermitTypeNamesByNeeded(needed: string) {
  return getPermits.value.filter((p) => p.needed === needed).map((p) => p.permitType?.name);
}

function onFileRemove(document: Document) {
  selectedFiles.value = selectedFiles.value.filter((x) => x.documentId !== document.documentId);
}

function onFileSelect(data: Document[]) {
  selectedFiles.value = data;
}

watchEffect(async () => {
  // Dumb, but need to do something with the ref for it to be watched properly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const permits = getPermits.value.concat();
  const project = getProject.value;

  // Get navigator details
  const configBCC = getConfig.value.ches?.roadmap?.bcc;
  let bcc = configBCC;
  let navigator = {
    email: configBCC ?? '',
    fullName: 'Permit Connect Navigator Service'
  };

  if (project?.assignedUserId) {
    const assignee = (await userService.searchUsers({ userId: [project.assignedUserId] })).data[0];

    if (assignee) {
      navigator = assignee;
      navigator.fullName = `${assignee.firstName} ${assignee.lastName}`;
      bcc = (bcc ? `${bcc}; ` : '') + assignee.email;
    }
  }

  // Permits
  const permitStateNew = getPermitTypeNamesByStatus(PermitStage.PRE_SUBMISSION).filter((value) =>
    getPermitTypeNamesByNeeded(PermitNeeded.YES).includes(value)
  );
  const permitPossiblyNeeded = getPermitTypeNamesByStatus(PermitStage.PRE_SUBMISSION).filter((value) =>
    getPermitTypeNamesByNeeded(PermitNeeded.UNDER_INVESTIGATION).includes(value)
  );
  const permitStateApplied = getPermitTypeNamesByStatus(PermitStage.APPLICATION_SUBMISSION);
  const permitStateCompleted = getPermitTypeNamesByStatus(PermitStage.POST_DECISION);

  // TODO: Remove nullish coalescing operator when prisma db has mappings for housing projects
  const contact = project?.activity?.activityContact?.[0]?.contact ?? project?.contacts?.[0];

  const body = roadmapTemplate({
    '{{ contactName }}': contact?.firstName && contact?.lastName ? `${contact?.firstName} ${contact?.lastName}` : '',
    '{{ projectName }}': project?.projectName,
    '{{ activityId }}': project?.activityId,
    '{{ permitStateNew }}': permitStateNew,
    '{{ permitPossiblyNeeded }}': permitPossiblyNeeded,
    '{{ permitStateApplied }}': permitStateApplied,
    '{{ permitStateCompleted }}': permitStateCompleted,
    '{{ navigatorName }}': navigator.fullName
  });

  const initiative = useAppStore().getInitiative.toLowerCase();

  // Initial form values
  initialFormValues.value = {
    from: navigator.email,
    to: contact?.email,
    cc: undefined,
    bcc: bcc,
    subject: `Here is your ${initiative} project's Permit Roadmap`,
    bodyType: 'text',
    body: body
  };

  formRef.value?.setFieldValue('from', navigator.email);
  formRef.value?.setFieldValue('to', contact?.email);
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
    <div class="grid grid-cols-12 gap-4">
      <InputText
        class="col-span-12 lg:col-span-6"
        name="to"
        label="To"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-span-12 lg:col-span-6"
        name="cc"
        label="CC"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-span-12 lg:col-span-6"
        name="bcc"
        label="BCC"
        :disabled="!editable"
      />
      <div class="col" />
      <InputText
        class="col-span-12 lg:col-span-6"
        name="subject"
        label="Subject"
        :disabled="!editable"
      />
      <div class="col" />
      <TextArea
        class="col-span-12"
        name="body"
        label="Note"
        :rows="10"
        :disabled="!editable"
      />
      <div class="col-span-12"><label class="font-bold">Add attachments</label></div>
      <div class="col-span-12 pt-2">
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
          <div class="flex items-center">
            <div>
              <Button
                class="p-button-sm p-button-outlined p-button-danger p-1 mr-1"
                @click="onFileRemove(document)"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </Button>
            </div>
            <div>
              {{ document.filename }}
              <span class="text-[var(--p-bcblue-900)] font-bold">{{ t('i.housing.project.roadmap.attached') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 pt-8">
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
