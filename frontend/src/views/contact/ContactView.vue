<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ContactForm from '@/components/contact/ContactForm.vue';
import { Button, Card } from '@/lib/primevue';
import { useContactStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const contactStore = useContactStore();
const { getContact, needsContactDetails } = storeToRefs(contactStore);

// State
const editable: Ref<boolean> = ref(false);
const contactRedirect: Ref<string | null> = ref(globalThis.sessionStorage.getItem(StorageKey.CONTACT_REDIRECT));

const handleGetStarted = () => {
  globalThis.sessionStorage.removeItem(StorageKey.CONTACT_REDIRECT);
  router.replace(contactRedirect.value || '/');
};

const onCancel = () => {
  editable.value = false;
};

const setEditable = (value: boolean) => {
  editable.value = value;
};

const updateContact = (contact: Contact) => {
  contactStore.setContact(contact);
  editable.value = false;
  if (!contactRedirect.value) router.back();
};

onBeforeMount(() => {
  if (needsContactDetails.value) editable.value = true;
});
</script>

<template>
  <div class="flex justify-center">
    <h2>{{ t('contactProfileView.fillOutProfile') }}</h2>
  </div>

  <div class="flex flex-col items-center gap-4">
    <Card>
      <template #title>
        <div class="flex justify-between items-center pb-4 px-3">
          <div class="flex items-center">
            <font-awesome-icon
              icon="fa-solid fa-user"
              class="mr-3 app-primary-color"
            />
            <h3 class="inline">{{ t('contactProfileView.contactProfile') }}</h3>
          </div>
          <Button
            v-if="!editable"
            class="p-button-text"
            @click="setEditable(true)"
          >
            <font-awesome-icon icon="fa-solid fa-pencil" />
            {{ t('contactForm.edit') }}
          </Button>
        </div>
      </template>
      <template #content>
        <ContactForm
          v-if="getContact"
          :contact="getContact"
          :editable="editable"
          :is-new-contact="needsContactDetails"
          @update-contact="updateContact"
        >
          <template #cancel>
            <Button
              class="p-button-danger"
              :label="t('cancelButton.btnText')"
              icon="pi pi-times"
              outlined
              @click="onCancel"
            />
          </template>
        </ContactForm>
      </template>
    </Card>
    <Button
      v-if="!needsContactDetails && contactRedirect"
      class="mr-2"
      :label="t('contactProfileView.getStarted')"
      @click="handleGetStarted"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-card-body) {
  width: 35rem;
  box-shadow: 0 0 0.2rem #036;
  padding-bottom: 1.5rem;
  padding-top: 1.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>
