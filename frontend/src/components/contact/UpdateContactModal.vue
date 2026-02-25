<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ContactForm from './ContactForm.vue';
import { Button, Dialog } from '@/lib/primevue';

import type { Contact } from '@/types';

// Composables
const { t } = useI18n();

// State
const visible = defineModel<boolean>('visible');
const contact = defineModel<Contact>('contact');

// Actions
function updateContact(updatedContact: Contact) {
  Object.assign(contact.value as Contact, updatedContact);
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-4/12"
  >
    <template #header>
      <span class="p-dialog-title px-3 py-1">{{ t('updateContactModal.header') }}</span>
    </template>
    <ContactForm
      v-if="contact"
      :contact="contact"
      :editable="!!visible"
      @update-contact="updateContact"
    >
      <template #cancel>
        <Button
          class="p-button-outlined"
          :label="t('contactForm.cancel')"
          icon="pi pi-times"
          @click="visible = false"
        />
      </template>
    </ContactForm>
  </Dialog>
</template>
