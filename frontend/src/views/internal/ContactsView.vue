<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewHeader from '@/components/common/ViewHeader.vue';
import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { contactService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { contactRouteNameKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Interfaces
interface InitiativeState {
  contactRouteName: RouteName;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  contactRouteName: RouteName.INT_ELECTRIFICATION_CONTACT_PAGE
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  contactRouteName: RouteName.INT_HOUSING_CONTACT_PAGE
};

// Composables
const { t } = useI18n();

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const contacts: Ref<Contact[]> = ref([]);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const loading: Ref<boolean> = ref(true);

// Providers
const provideContactRouteName = computed(() => initiativeState.value.contactRouteName);
provide(contactRouteNameKey, provideContactRouteName);

// Actions
function removeContact(contact: Contact) {
  const idx = contacts.value.findIndex((c) => c.contactId === contact.contactId);
  if (idx !== -1) contacts.value.splice(idx, 1);
}

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    contacts.value = (
      await contactService.searchContacts({
        initiative: getInitiative.value,
        includeActivities: true,
        hasActivity: true
      })
    ).data.filter((x) => x.activityContact?.length);

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <ViewHeader :header="t('views.i.contactsView.contactsHeader')" />
  <Tabs
    v-if="!loading"
    :value="0"
  >
    <TabList>
      <Tab :value="0">{{ t('views.i.contactsView.proponentsTab') }}</Tab>
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
