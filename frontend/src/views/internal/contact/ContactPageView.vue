<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ContactHistoryList from '@/components/contact/ContactHistoryList.vue';
import { InputText, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { contactService, housingProjectService, enquiryService, userService } from '@/services';
import { IdentityProviderKind, RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { ActivityContact, Contact, Enquiry, HousingProject, User } from '@/types';
import { findIdpConfig } from '@/utils/utils';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const activeTabIndex: Ref<number> = ref(0);
const assignedUsers: Ref<Record<string, string>> = ref({});
const contact: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const housingProjectsEnquiries: Ref<Array<HousingProject | Enquiry>> = ref([]);

const fullName = computed(() => {
  const firstName = contact.value?.firstName ?? '';
  const lastName = contact.value?.lastName ?? '';
  return `${firstName} ${lastName}`.trim();
});

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
  const includeActivities = true;
  const contactData = (await contactService.getContact(contactId, includeActivities)).data;
  const activityIds = contactData.activityContact.map((ac: ActivityContact) => ac.activityId);

  if (activityIds.length) {
    const [submissions, enquiries] = (
      await Promise.all([
        housingProjectService.searchProjects({ activityId: activityIds }),
        enquiryService.searchEnquiries({ activityId: activityIds })
      ])
    ).map((r) => r.data);

    housingProjectsEnquiries.value = housingProjectsEnquiries.value.concat(submissions).concat(enquiries);
  }

  contact.value = contactData;

  // Map users ids to full names for history data table
  let userIds: Array<string> = [];
  housingProjectsEnquiries.value.forEach((se) => {
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
        readonly
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
        readonly
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
        readonly
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
        readonly
        :value="contact?.contactApplicantRelationship"
      />
    </div>
  </div>
  <Tabs
    v-if="!loading"
    :value="activeTabIndex"
  >
    <TabList>
      <Tab :value="0">{{ t('i.housing.contactPageView.historyTab') }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <span v-if="!loading">
          <ContactHistoryList
            :loading="loading"
            :contacts-history="housingProjectsEnquiries"
            :assigned-users="assignedUsers"
          />
        </span>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
