<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object, string, mixed } from 'yup';

import Divider from '@/components/common/Divider.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { Checkbox, DatePicker, InputText, Select, TextArea } from '@/components/form';
import { Button, Card, Message, ToggleSwitch, useConfirm, useToast } from '@/lib/primevue';
import { noteHistoryService, userService } from '@/services';
import { useAppStore, useAuthZStore, useCodeStore, useConfigStore, useEnquiryStore, useProjectStore } from '@/store';
import { BRING_FORWARD_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/projectCommon';
import { GroupName, Resource } from '@/utils/enums/application';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';
import { formatDate, formatTime } from '@/utils/formatters';
import { projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';
import { bringForwardEnquiryNotificationTemplate, bringForwardProjectNotificationTemplate } from '@/utils/templates';
import { scrollToFirstError } from '@/utils/utils';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { NoteHistory, User } from '@/types';

// Props
const { editable, noteHistory = undefined } = defineProps<{
  editable?: boolean;
  noteHistory?: NoteHistory;
}>();

// Injections
const projectRouteName = inject(projectRouteNameKey);
const projectService = inject(projectServiceKey);
const resource = inject(resourceKey);

// Constants
const NOTES_TAB_INDEX = {
  ENQUIRY: 1,
  SUBMISSION: 3
};

// Composables
const { t } = useI18n();
const authzStore = useAuthZStore();
const confirmDialog = useConfirm();
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();
const router = useRouter();
const toast = useToast();
const { options } = useCodeStore();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const { getProject } = storeToRefs(projectStore);
const { getEnquiry } = storeToRefs(enquiryStore);

// State
const createdByFullNames: Ref<Record<string, string>> = ref({});
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const shownToProponent: Ref<boolean> = ref(false);

// Actions
const formSchema = object({
  bringForwardDate: mixed()
    .nullable()
    .when('type', {
      is: (type: string) => type === NoteType.BRING_FORWARD,
      then: (schema) => schema.required(t('note.noteForm.bfDateReqd')),
      otherwise: (schema) => schema.nullable()
    })
    .label('Bring forward date'),
  bringForwardState: mixed()
    .when('type', {
      is: (type: string) => type === NoteType.BRING_FORWARD,
      then: () => string().oneOf(BRING_FORWARD_TYPE_LIST),
      otherwise: () => mixed().nullable()
    })
    .label('Bring forward state'),
  note: string()
    .when('noteHistoryId', {
      is: (noteHistoryId: string) => noteHistoryId === undefined,
      then: (schema) => schema.required(t('note.noteForm.noteReqd')),
      otherwise: (schema) => schema.notRequired()
    })
    .label('Note'),
  type: string().oneOf(NOTE_TYPE_LIST).label('Note type'),
  title: string().required().max(255, t('note.noteForm.titleLong')).label('Title'),
  escalationType: mixed()
    .when(['escalateToSupervisor', 'escalateToDirector'], {
      is: (escalateToSupervisor: boolean, escalateToDirector: boolean) => escalateToSupervisor || escalateToDirector,
      then: (schema) => schema.required(t('note.noteForm.escalationTypeReqd')),
      otherwise: (schema) => schema.nullable()
    })
    .label('Escalation type')
});

function initializeFormValues() {
  if (noteHistory) {
    initialFormValues.value = {
      activityId: noteHistory.activityId,
      bringForwardDate: noteHistory?.bringForwardDate ? new Date(noteHistory.bringForwardDate) : null,
      bringForwardState: noteHistory?.bringForwardState ?? null,
      escalateToSupervisor: noteHistory?.escalateToSupervisor,
      escalateToDirector: noteHistory?.escalateToDirector,
      escalationType: noteHistory?.escalationType,
      noteHistoryId: noteHistory.noteHistoryId,
      type: noteHistory.type,
      title: noteHistory.title
    };
    shownToProponent.value = noteHistory.shownToProponent;
  } else {
    initialFormValues.value = {
      type: NoteType.GENERAL
    };
  }
}
// }

function onInvalidSubmit(e: any) {
  scrollToFirstError(e.errors);
}

function onDelete() {
  if (noteHistory) {
    confirmDialog.require({
      message: t(shownToProponent.value ? 'note.noteForm.deleteMessageIfShown' : 'note.noteForm.deleteMessage'),
      header: t('note.noteForm.deleteHeader'),
      acceptLabel: t('note.noteForm.confirm'),
      acceptClass: 'p-button-danger',
      rejectLabel: t('note.noteForm.cancel'),
      rejectProps: { outlined: true },
      accept: () => {
        noteHistoryService
          .deleteNoteHistory(noteHistory?.noteHistoryId as string)
          .then(() => {
            toast.success(t('note.noteForm.noteDeleted'));
            navigateToOrigin();
          })
          .catch((e: any) => toast.error(t('note.noteForm.noteDeleteFailed'), e.message));
      }
    });
  }
}

async function onSubmit(data: any) {
  try {
    const body = { ...data };

    // Force some data based on the type of note
    if (body.type === NoteType.BRING_FORWARD) {
      body.shownToProponent = false;
      if (!body.escalateToSupervisor && !body.escalateToDirector) body.escalationType = null;
    } else {
      body.bringForwardDate = null;
      body.bringForwardState = null;
      body.escalateToSupervisor = false;
      body.escalateToDirector = false;
      body.escalationType = null;
      body.shownToProponent = shownToProponent.value;
    }

    if (!noteHistory) {
      await noteHistoryService.createNoteHistory({
        ...body,
        activityId: getProject.value?.activityId || getEnquiry.value?.activityId,
        note: data.note
      });
    } else {
      await noteHistoryService.updateNoteHistory(data.noteHistoryId, {
        ...body,
        activityId: getProject.value?.activityId || getEnquiry.value?.activityId,
        note: data.note
      });
      if (
        body.type === NoteType.BRING_FORWARD &&
        body.escalateToSupervisor &&
        !authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER, GroupName.SUPERVISOR])
      ) {
        emailNotification();
      }
    }
    toast.success(t('note.noteForm.noteSaved'));
    navigateToOrigin();
  } catch (e: any) {
    toast.error(t('note.noteForm.noteSaveFailed'), e.message);
  }
}

function onTypeChange(e: SelectChangeEvent) {
  if (e.value === NoteType.BRING_FORWARD) {
    formRef.value?.setFieldValue('bringForwardState', BringForwardType.UNRESOLVED);
    shownToProponent.value = false;
  }
}

async function fetchCreatedBy() {
  const userIds = Array.from(new Set(noteHistory?.note.map((n) => n.createdBy).filter(Boolean))) as [];
  const users = (await userService.searchUsers({ userId: userIds })).data;
  users.forEach((u: User) => {
    createdByFullNames.value[u.userId] = u.fullName;
  });
}

function navigateToOrigin() {
  if (!resource?.value) throw new Error('Resource not defined');
  if (resource.value === Resource.ENQUIRY) {
    router.push({
      name: projectRouteName?.value,
      params: { enquiryId: getEnquiry.value?.enquiryId },
      query: {
        initialTab: NOTES_TAB_INDEX.ENQUIRY
      }
    });
  } else {
    router.push({
      name: projectRouteName?.value,
      params: { projectId: getProject.value?.projectId },
      query: {
        initialTab: NOTES_TAB_INDEX.SUBMISSION
      }
    });
  }
}

async function emailNotification() {
  const supervisors = (
    await userService.searchUsers({ group: [GroupName.SUPERVISOR], initiative: [useAppStore().getInitiative] })
  ).data;
  const supervisorsEmails = supervisors.map((u: User) => u.email);

  if (supervisorsEmails.length === 0) return;

  const configCC = getConfig.value.ches?.submission?.cc;
  let body: string;
  if (resource?.value === Resource.ENQUIRY) {
    body = bringForwardEnquiryNotificationTemplate({
      '{{ activityId }}': getEnquiry.value?.activityId
    });
  } else {
    body = bringForwardProjectNotificationTemplate({
      '{{ projectName }}': getProject.value?.projectName,
      '{{ activityId }}': getProject.value?.activityId
    });
  }

  let emailData = {
    from: configCC,
    to: supervisorsEmails,
    subject: t('note.noteForm.escalationEmailTitle'),
    bodyType: 'html',
    body: body
  };

  if (!projectService?.value) throw new Error('No service');
  await projectService.value.emailConfirmation(emailData);
}

onBeforeMount(async () => {
  initializeFormValues();
  if (noteHistory) {
    fetchCreatedBy();
  }
});
</script>

<template>
  <div class="flex flex-row gap-x-3 my-4">
    <div class="flex flex-row gap-x-1">
      <span class="text-[var(--p-bcblue-900)]">{{ t('note.noteForm.created') }}:</span>
      <span>
        {{ formatDate(noteHistory?.createdAt || new Date().toISOString()) }}
      </span>
    </div>
    <div class="flex flex-row gap-x-1">
      <span class="text-[var(--p-bcblue-900)]">{{ t('note.noteForm.lastUpdated') }}:</span>
      <span>{{ formatDate(noteHistory?.updatedAt) }}</span>
    </div>
  </div>
  <Message
    v-if="shownToProponent"
    severity="warn"
    class="text-center mt-5 mb-8"
  >
    {{ t('note.noteForm.shownToPropBanner') }}
  </Message>
  <Form
    ref="formRef"
    v-slot="{ values }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @invalid-submit="onInvalidSubmit"
    @submit="onSubmit"
  >
    <input
      type="hidden"
      name="noteHistoryId"
    />
    <Card>
      <template #content>
        <div class="grid grid-cols-[3fr_1fr] gap-x-9 mt-4">
          <div class="flex flex-col gap-y-3">
            <div class="flex flex-row gap-x-3">
              <Select
                class="w-1/2"
                name="type"
                label="Note type"
                :options="NOTE_TYPE_LIST"
                :disabled="!editable"
                @on-change="onTypeChange"
              />
              <InputText
                class="w-1/2"
                name="title"
                label="Note title"
                :disabled="!editable"
              />
            </div>
            <div class="flex items-center">
              <h6 class="font-bold text-[var(--p-bcblue-850)]">{{ t('note.noteForm.note') }}</h6>
              <Tooltip
                v-if="
                  values.type === NoteType.BRING_FORWARD && (values.escalateToDirector || values.escalateToSupervisor)
                "
                class="pl-2"
                right
                icon="fa-solid fa-circle-question"
                :text="t('note.noteForm.bfNoteHint')"
              />
            </div>
            <TextArea
              name="note"
              :disabled="!editable"
              :placeholder="
                values.type === NoteType.BRING_FORWARD && (values.escalateToDirector || values.escalateToSupervisor)
                  ? t('note.noteForm.bfNoteHint')
                  : ''
              "
            />
          </div>

          <div class="flex">
            <Divider layout="vertical" />
            <div class="flex flex-col gap-y-9 mx-5">
              <div>
                <div
                  v-if="values.type === NoteType.GENERAL"
                  class="flex flex-col gap-y-4"
                >
                  <span class="font-bold">{{ t('note.noteForm.showProponent') }}</span>
                  <ToggleSwitch
                    v-model="shownToProponent"
                    class="mr-1"
                    name="shownToProponent"
                    :label="t('note.noteForm.showProponent')"
                    :disabled="!editable"
                  />
                </div>

                <div
                  v-if="values.type === NoteType.BRING_FORWARD"
                  class="grid grid-cols-1 gap-y-1"
                >
                  <Checkbox
                    name="escalateToSupervisor"
                    :label="t('note.noteForm.escalateToSupervisor')"
                    :bold="false"
                    :disabled="
                      !editable || authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER, GroupName.SUPERVISOR])
                    "
                  />
                  <Checkbox
                    name="escalateToDirector"
                    :label="t('note.noteForm.escalateToDirector')"
                    :bold="false"
                    :disabled="!editable || authzStore.isInGroup([GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY])"
                  />
                  <DatePicker
                    v-if="values.type === NoteType.BRING_FORWARD"
                    class="my-2"
                    name="bringForwardDate"
                    label="Bring forward date"
                    :disabled="!editable"
                  />
                  <div
                    v-if="values.escalateToSupervisor || values.escalateToDirector"
                    class="flex flex-col"
                  >
                    <Select
                      name="escalationType"
                      label="Escalation type"
                      option-label="label"
                      option-value="value"
                      :options="options.EscalationType"
                      :disabled="!editable"
                    />
                  </div>
                  <Select
                    name="bringForwardState"
                    label="Bring forward state"
                    :options="BRING_FORWARD_TYPE_LIST"
                    :disabled="!editable"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
    <div class="field flex">
      <div class="flex-auto">
        <Button
          class="mr-2"
          label="Save"
          type="submit"
          icon="pi pi-check"
          :disabled="!editable"
        />
        <Button
          class="p-button-outlined mr-2"
          label="Cancel"
          icon="pi pi-times"
          @click="navigateToOrigin()"
        />
      </div>
      <div
        v-if="noteHistory"
        class="flex justify-content-right"
      >
        <Button
          class="p-button-outlined p-button-danger mr-2"
          label="Delete"
          icon="pi pi-trash"
          :disabled="!editable"
          @click="onDelete"
        />
      </div>
    </div>
  </Form>
  <div class="flex flex-col gap-y-2 my-9">
    <div
      v-for="note in noteHistory?.note"
      :key="note.noteId"
      class="bg-[var(--p-bcblue-50)] p-4"
    >
      <div class="flex flex-row gap-x-2">
        <span class="text-[var(--p-bcblue-900)]">{{ formatDate(note.createdAt) }}:</span>
        {{ note.note }}
        <span class="text-[var(--p-greyscale-600)]">
          {{ formatTime(note.createdAt) }}
          <span v-if="note.createdBy">{{ createdByFullNames[note.createdBy] }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
