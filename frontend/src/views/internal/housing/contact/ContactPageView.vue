<script setup lang="ts">
import { provide } from 'vue';

import ContactPage from '@/components/contact/ContactPage.vue';
import { housingProjectService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { contactInitiativeRouteNameKey, projectServiceKey } from '@/utils/keys';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Providers
provide(projectServiceKey, housingProjectService);
provide(contactInitiativeRouteNameKey, RouteName.INT_HOUSING_CONTACT);
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
