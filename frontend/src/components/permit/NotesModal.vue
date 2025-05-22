<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { object, string } from 'yup';

import { DatePicker, TextArea } from '@/components/form';
import { Button, Dialog, useToast } from '@/lib/primevue';
import { permitNoteService } from '@/services';
import { useConfigStore, useProjectStore } from '@/store';
import { PermitNeeded, PermitStatus } from '@/utils/enums/permit';
import { formatDate, formatDateLong } from '@/utils/formatters';
import { projectServiceKey } from '@/utils/keys';
import { permitNoteNotificationTemplate } from '@/utils/templates';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

const projectService = inject(projectServiceKey);

// Composables
const { t } = useI18n();
const toast = useToast();

// Store
const projectStore = useProjectStore();
const { getConfig } = storeToRefs(useConfigStore());

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  createdAt: new Date(),
  note: ''
};

// Form validation schema
const formSchema = object({
  note: string().required().label('Note')
});

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: any, { resetForm }) {
  try {
    const response = await permitNoteService.createPermitNote({ note: data.note as string, permitId: permit.permitId });
    const newNote = response.data;
    const permitForNote = projectStore.getPermits.find((p) => p.permitId === newNote.permitId);

    if (permitForNote) {
      const updatedPermit = {
        ...permitForNote,
        permitNote: permitForNote.permitNote ? [newNote, ...permitForNote.permitNote] : [newNote]
      };

      projectStore.updatePermit(updatedPermit);
      // send email to the user if permit is needed and uis submitted
      if (permit.needed === PermitNeeded.YES || permit.status !== PermitStatus.NEW) emailNotification();
    }

    resetForm();
  } catch (e: any) {
    toast.error('Failed to save note', e.message);
  }
}

async function emailNotification() {
  const configCC = getConfig.value.ches?.submission?.cc;
  const project = projectStore.getProject;
  const body = permitNoteNotificationTemplate({
    '{{ contactName }}': project?.contacts[0].firstName,
    '{{ activityId }}': project?.activityId,
    '{{ permitName }}': permit.permitType.name,
    '{{ submittedDate }}': formatDate(permit.submittedDate ?? permit.createdAt),
    '{{ projectId }}': project?.projectId,
    '{{ permitId }}': permit.permitId
  });
  let applicantEmail = project?.contacts[0].email as string;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: `Updates for project ${project?.activityId}, ${permit.permitType.name}`,
    bodyType: 'html',
    body: body
  };

  if (!projectService) throw new Error('No service');

  await projectService.emailConfirmation(emailData);
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">{{ t('permitNotesModal.title') }}</span>
    </template>
    <h4 class="mb-4">{{ permit.permitType.name }}</h4>
    <Form
      ref="formRef"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-12 gap-4">
        <DatePicker
          class="col-span-6"
          name="createdAt"
          label="Date"
          :disabled="true"
          :show-time="true"
        />
        <TextArea
          class="col-span-12"
          name="note"
          label="Note"
          maxlength="255"
          required
          :placeholder="t('permitNotesModal.notePlaceholder')"
        />
        <div class="field col-span-12 flex">
          <div class="flex-auto">
            <Button
              class="mr-2"
              label="Publish"
              type="submit"
            />
            <Button
              class="p-button-outlined mr-2"
              label="Cancel"
              icon="pi pi-times"
              @click="() => (visible = false)"
            />
          </div>
        </div>
      </div>
    </Form>
    <div class="updates-section mt-8">
      <h4 class="mb-6">Updates</h4>
      <div v-if="permit.permitNote && permit.permitNote.length > 0">
        <div
          v-for="note in permit.permitNote"
          :key="note.permitNoteId"
          class="mb-6"
        >
          <p class="mb-2 font-bold">{{ formatDateLong(note.createdAt) }}</p>
          <p class="mt-0">{{ note.note }}</p>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-500">{{ t('permitNotesModal.noUpdates') }}</p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.notes-section {
  padding-top: 1rem;
}
</style>
