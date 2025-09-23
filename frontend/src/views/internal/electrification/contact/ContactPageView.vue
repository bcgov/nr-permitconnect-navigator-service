<script setup lang="ts">
import { provide, ref } from 'vue';

import ContactPage from '@/components/contact/ContactPage.vue';
import { electrificationProjectService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { contactInitiativeRouteNameKey, projectServiceKey } from '@/utils/keys';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Providers
provide(projectServiceKey, ref(electrificationProjectService));
provide(contactInitiativeRouteNameKey, RouteName.INT_ELECTRIFICATION_CONTACT);
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
