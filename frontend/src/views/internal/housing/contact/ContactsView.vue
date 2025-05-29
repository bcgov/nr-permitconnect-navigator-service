<script setup lang="ts">
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewHeader from '@/components/common/ViewHeader.vue';
import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { contactService } from '@/services';
import { useAppStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { contactInitiativeRouteNameKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Composables
const { t } = useI18n();

// State
const contacts: Ref<Array<Contact>> = ref([]);
const loading: Ref<boolean> = ref(true);

// Providers
provide(contactInitiativeRouteNameKey, RouteName.INT_HOUSING_CONTACT_PAGE);

// Actions
function removeContact(contact: Contact) {
  const idx = contacts.value.findIndex((c) => c.contactId === contact.contactId);
  if (idx !== -1) contacts.value.splice(idx, 1);
}

onBeforeMount(async () => {
  contacts.value = (
    await contactService.searchContacts({ initiative: useAppStore().getInitiative, includeActivities: true })
  ).data;
  loading.value = false;
});
</script>

<template>
  <ViewHeader :header="t('i.contact.contactsView.contactsHeader')" />
  <Tabs
    v-if="!loading"
    :value="0"
  >
    <TabList>
      <Tab :value="0">{{ t('i.contact.contactsView.proponentsTab') }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <ContactsProponentsList
          :loading="loading"
          :contacts="contacts"
          @contact-deleted="removeContact"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
