<script setup lang="ts">
import { isAxiosError } from 'axios';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import UpdateContactModal from '@/components/contact/UpdateContactModal.vue';
import ContactHistoryList from '@/components/contact/ContactHistoryList.vue';
import { Button, Card, Message, Tab, Tabs, TabList, TabPanel, TabPanels, useConfirm, useToast } from '@/lib/primevue';
import { contactService, enquiryService, userService } from '@/services';
import { IdentityProviderKind } from '@/utils/enums/application';
import { contactInitiativeRouteNameKey, projectServiceKey } from '@/utils/keys';
import { findIdpConfig } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ActivityContact, Contact, ElectrificationProject, Enquiry, HousingProject, User } from '@/types';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Injections
const contactInitiativeRoute = inject(contactInitiativeRouteNameKey);
const projectService = inject(projectServiceKey);

// Composables
const { t } = useI18n();
const confirmDialog = useConfirm();
const router = useRouter();
const toast = useToast();

// State
const assignedUsers: Ref<Record<string, string>> = ref({});
const contact: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const projectsEnquiries: Ref<(ElectrificationProject | HousingProject | Enquiry)[]> = ref([]);
const updateContactModalVisible: Ref<boolean> = ref(false);

const fullName = computed(() => {
  const firstName = contact.value?.firstName ?? '';
  const lastName = contact.value?.lastName ?? '';
  return `${firstName} ${lastName}`.trim();
});

// Actions
function onDelete() {
  confirmDialog.require({
    message:
      t('contactsProponentsList.deleteContactMessage') + contact.value?.firstName + ' ' + contact.value?.lastName,
    header: t('contactsProponentsList.deleteContactHeader'),
    acceptLabel: t('contactsProponentsList.confirm'),
    acceptClass: 'p-button-danger',
    acceptIcon: 'pi pi-trash',
    rejectLabel: t('contactsProponentsList.cancel'),
    rejectIcon: 'pi pi-times',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        if (!contact.value) {
          toast.error(t('contactsProponentsList.deleteContactNotLoaded'));
        } else {
          const response = await contactService.deleteContact(contact.value.contactId);
          if (response.status !== 204) {
            throw new Error();
          }
          toast.success(
            t('contactsProponentsList.deleteContactSuccess'),
            `${contact.value?.firstName} ${contact.value?.lastName}
             ${t('contactsProponentsList.deleteContactSuccessMessage')}`
          );
        }
      } catch (e) {
        if (isAxiosError(e) || e instanceof Error)
          toast.error(t('contactsProponentsList.deleteContactFailed'), String(e.message));
      }
      router.push({
        name: contactInitiativeRoute
      });
    }
  });
}

onBeforeMount(async () => {
  const contactData = (await contactService.getContact(contactId, true)).data;
  const activityIds = contactData.activityContact?.map((ac: ActivityContact) => ac.activityId);

  contact.value = contactData;

  if (activityIds?.length) {
    const [projects, enquiries] = (
      await Promise.all([
        projectService?.value.searchProjects({ activityId: activityIds }),
        enquiryService.searchEnquiries({ activityId: activityIds })
      ])
    ).map((r) => r?.data);

    projectsEnquiries.value = projectsEnquiries.value.concat(projects).concat(enquiries);
  }
  // Map users ids to full names for history data table
  let userIds: string[] = [];
  projectsEnquiries.value.forEach((pe) => {
    if (pe.assignedUserId) userIds.push(pe.assignedUserId);
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
  <div class="pt-5">
    <Message
      v-if="!contact?.userId && projectsEnquiries.length > 0"
      id="hasHistoryMessage"
      severity="warn"
      :closable="false"
    >
      {{ t('contactPage.hasHistoryWarningMessage') }}
    </Message>
    <div class="flex items-center justify-between mb-5">
      <h1>
        {{ fullName }}
      </h1>
      <div
        v-if="contact && !contact.userId"
        class="flex gap-x-4"
      >
        <Button
          aria-label="Update Contact"
          outlined
          @click="
            () => {
              updateContactModalVisible = true;
            }
          "
        >
          <font-awesome-icon
            icon="fa-solid fa-pen-to-square"
            fixed-width
          />
          {{ t('contactPage.updateButtonLabel') }}
        </Button>
        <Button
          class="p-button-danger"
          aria-label="Delete Contact"
          outlined
          :disabled="projectsEnquiries.length > 0"
          @click="onDelete()"
        >
          <font-awesome-icon
            icon="fa-solid fa-trash"
            fixed-width
          />
          {{ t('contactPage.deleteButtonLabel') }}
        </Button>
      </div>
    </div>
    <Card>
      <template #content>
        <div class="flex gap-x-16 p-2">
          <div>
            <label
              class="block font-bold"
              for="phoneNumber"
            >
              {{ t('contactPage.contactPhoneLabel') }}
            </label>
            <span>{{ contact?.phoneNumber }}</span>
          </div>
          <div>
            <label
              class="block font-bold"
              for="email"
            >
              {{ t('contactPage.contactEmailLabel') }}
            </label>
            <span>{{ contact?.email }}</span>
          </div>
          <div>
            <label
              class="block font-bold"
              for="contactPreference"
            >
              {{ t('contactPage.contactPreferredLabel') }}
            </label>
            <span>{{ contact?.contactPreference }}</span>
          </div>
          <div>
            <label
              class="block font-bold"
              for="contactApplicantRelationship"
            >
              {{ t('contactPage.contactRelationshipLabel') }}
            </label>
            <span>{{ contact?.contactApplicantRelationship }}</span>
          </div>
        </div>
      </template>
    </Card>
    <Tabs
      v-if="!loading"
      class="mt-12"
      :value="0"
    >
      <TabList>
        <Tab :value="0">{{ t('contactPage.historyTab') }}</Tab>
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
    <UpdateContactModal
      v-model:visible="updateContactModalVisible"
      v-model:contact="contact"
    />
  </div>
</template>
