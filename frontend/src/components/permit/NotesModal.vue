<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object, string } from 'yup';

import { Calendar, TextArea } from '@/components/form';
import { Button, Dialog, useToast } from '@/lib/primevue';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit, PermitNote } from '@/types';
import permitNoteService from '@/services/permitNoteService';

// Props
const { permit, permitName } = defineProps<{
  permit: Permit;
  permitName: string;
}>();

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const notes: Ref<Array<PermitNote>> = ref(permit.permitNote || []);
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

// Actions
const toast = useToast();

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: any, { resetForm }) {
  try {
    const response = await permitNoteService.createPermitNote({ note: data.note as string, permitId: permit.permitId });

    const newNote = response.data;
    notes.value.unshift(newNote);

    resetForm();
  } catch (e: any) {
    toast.error('Failed to save note', e.message);
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">Add updates</span>
    </template>
    <h4 class="mb-4">{{ permitName }}</h4>
    <Form
      ref="formRef"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="formgrid grid">
        <Calendar
          class="col-6"
          name="createdAt"
          label="Date"
          :disabled="true"
          :show-time="true"
        />
        <TextArea
          class="col-12"
          name="note"
          label="Note"
          maxlength="255"
          placeholder="Please try to keep the note concise, ideally under 60 words."
          required
        />
        <div class="field col-12 flex">
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
    <div class="updates-section mt-5">
      <h4 class="mb-4">Updates</h4>
      <div v-if="notes.length > 0">
        <div
          v-for="note in notes"
          :key="note.permitNoteId"
          class="mb-4"
        >
          <p class="mb-2 font-bold">{{ formatDateLong(note.createdAt) }}</p>
          <p class="mt-0">{{ note.note }}</p>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-500">There are no updates.</p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.notes-section {
  padding-top: 1rem;
}
</style>
