<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { contactService } from '@/services';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const activeTabIndex: Ref<number> = ref(route.query.tab ? Number(route.query.tab) : 0);
const contacts: Ref<Array<Contact>> = ref([]);
const loading: Ref<boolean> = ref(true);

// Actions

// Watch for tab changes
watch(activeTabIndex, (newIndex) => {
  const curTab = Number(route.query.tab ?? 0);
  if (curTab !== newIndex) {
    router.replace({
      name: RouteName.INT_CONTACT,
      query: {
        ...route.query,
        tab: newIndex.toString()
      }
    });
  }
});

// Watch for forward/back button chancges
watch(
  () => route.query.tab,
  (tabVal) => {
    const newIndex = Number(tabVal ?? 0);
    if (activeTabIndex.value !== newIndex) {
      activeTabIndex.value = newIndex;
    }
  }
);

onBeforeMount(async () => {
  contacts.value = (await contactService.searchContacts({})).data;

  loading.value = false;
});
</script>

<template>
  <h1>{{ t('contactsView.contactsHeader') }}</h1>
  <Tabs
    v-if="!loading"
    v-model:value="activeTabIndex"
  >
    <TabList>
      <Tab :value="0">{{ t('contactsView.proponentsTab') }}</Tab>
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
