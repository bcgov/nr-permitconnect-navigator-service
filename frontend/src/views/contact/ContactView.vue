<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import ContactForm from '@/components/contact/ContactForm.vue';
import { Card } from '@/lib/primevue';
import { useContactStore } from '@/store';

// Composables
const { t } = useI18n();

// Store
const contactStore = useContactStore();
const { getContact } = storeToRefs(contactStore);
const { setContact } = contactStore;
</script>

<template>
  <div class="flex justify-center">
    <h2>{{ t('contactProfileView.fillOutProfile') }}</h2>
  </div>

  <div class="flex justify-center">
    <Card>
      <template #title>
        <div class="flex justify-between pb-4 px-3">
          <div class="inline">
            <font-awesome-icon
              icon="fa-solid fa-user"
              class="mr-3 app-primary-color"
            />
            <h3 class="inline">{{ t('contactProfileView.contactProfile') }}</h3>
          </div>
        </div>
      </template>
      <template #content>
        <ContactForm
          v-if="getContact"
          :contact="getContact"
          @update-contact="setContact"
        />
      </template>
    </Card>
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
