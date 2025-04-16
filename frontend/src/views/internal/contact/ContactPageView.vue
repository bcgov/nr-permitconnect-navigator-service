<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactHistoryList from '@/components/contact/ContactHistoryList.vue';
import { InputText, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import {
  contactService,
  electrificationProjectService,
  housingProjectService,
  enquiryService,
  userService
} from '@/services';
import { useAppStore } from '@/store';
import { IdentityProviderKind, Initiative } from '@/utils/enums/application';
import { findIdpConfig } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ActivityContact, Contact, ElectrificationProject, Enquiry, HousingProject, User } from '@/types';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Composables
const { t } = useI18n();

// State
const assignedUsers: Ref<Record<string, string>> = ref({});
const contact: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const projectsEnquiries: Ref<Array<ElectrificationProject | HousingProject | Enquiry>> = ref([]);

const fullName = computed(() => {
  const firstName = contact.value?.firstName ?? '';
  const lastName = contact.value?.lastName ?? '';
  return `${firstName} ${lastName}`.trim();
});

// Actions
onBeforeMount(async () => {
  const includeActivities = true;
  const contactData = (await contactService.getContact(contactId, includeActivities)).data;
  const activityIds = contactData.activityContact.map((ac: ActivityContact) => ac.activityId);

  if (activityIds.length) {
    const [electrification, housing] = (
      await Promise.all([
        electrificationProjectService.searchProjects({ activityId: activityIds }),
        housingProjectService.searchProjects({ activityId: activityIds })
      ])
    ).map((r) => r.data);

    projectsEnquiries.value = projectsEnquiries.value.concat(electrification).concat(housing);

    // Need to force override the initiative for these calls
    useAppStore().setInitiative(Initiative.ELECTRIFICATION);
    const elecEnquiries = (await enquiryService.searchEnquiries({ activityId: activityIds })).data;
    projectsEnquiries.value = projectsEnquiries.value.concat(elecEnquiries);

    useAppStore().setInitiative(Initiative.HOUSING);
    const housingEnquiries = (await enquiryService.searchEnquiries({ activityId: activityIds })).data;
    projectsEnquiries.value = projectsEnquiries.value.concat(housingEnquiries);

    // Set initiative back to what it should be
    useAppStore().setInitiative(Initiative.PCNS);
  }

  contact.value = contactData;

  // Map users ids to full names for history data table
  let userIds: Array<string> = [];
  projectsEnquiries.value.forEach((se) => {
    if (se.assignedUserId) userIds.push(se.assignedUserId);
  });

  if (userIds) {
    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);
    if (idpCfg) {
      const users = (await userService.searchUsers({ userId: userIds, idp: [idpCfg.idp] })).data;
      users.forEach((u: User) => {
        assignedUsers.value[u.userId] = u.fullName;
      });
    }
  }

  loading.value = false;
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h2>
        {{ fullName }}
      </h2>
    </div>
    <div class="grid grid-cols-4 gap-6 mb-10">
      <div>
        <label
          class="block font-bold mb-1"
          for="phoneNumber"
        >
          {{ t('i.housing.contactPageView.contactPhoneLabel') }}
        </label>
        <InputText
          id="phoneNumber"
          class="w-full"
          disabled
          :value="contact?.phoneNumber"
        />
      </div>
      <div>
        <label
          class="block font-bold mb-1"
          for="email"
        >
          {{ t('i.housing.contactPageView.contactEmailLabel') }}
        </label>
        <InputText
          id="email"
          class="w-full"
          disabled
          :value="contact?.email"
        />
      </div>
      <div>
        <label
          class="block font-bold mb-1"
          for="contactPreference"
        >
          {{ t('i.housing.contactPageView.contactPreferredLabel') }}
        </label>
        <InputText
          id="contactPreference"
          class="w-full"
          disabled
          :value="contact?.contactPreference"
        />
      </div>
      <div>
        <label
          class="block font-bold mb-1"
          for="contactApplicantRelationship"
        >
          {{ t('i.housing.contactPageView.contactRelationshipLabel') }}
        </label>
        <InputText
          id="contactApplicantRelationship"
          class="w-full"
          disabled
          :value="contact?.contactApplicantRelationship"
        />
      </div>
    </div>
    <Tabs
      v-if="!loading"
      :value="0"
    >
      <TabList>
        <Tab :value="0">{{ t('i.housing.contactPageView.historyTab') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel :value="0">
          <span v-if="!loading">
            <ContactHistoryList
              :loading="loading"
              :contacts-history="projectsEnquiries"
              :assigned-users="assignedUsers"
            />
          </span>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
