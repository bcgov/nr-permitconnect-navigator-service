<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { contactService } from '@/services';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Composables
const { t } = useI18n();

// State
const contacts: Ref<Array<Contact>> = ref([]);
const loading: Ref<boolean> = ref(true);

// Actions
onBeforeMount(async () => {
  contacts.value = (await contactService.searchContacts({})).data;
  loading.value = false;
});
</script>

<template>
  <h1>{{ t('i.contact.contactsView.contactsHeader') }}</h1>
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
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
