<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import {
  Button,
  Column,
  DataTable,
  Dialog,
  IconField,
  InputIcon,
  InputText,
  Message,
  Select,
  useToast
} from '@/lib/primevue';
import { InputMask, InputText as InputTextFormItem, Select as SelectFormItem } from '@/components/form';
import { contactService } from '@/services';
import { useAppStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import {
  ACTIVITY_CONTACT_ROLE_LIST,
  CONTACT_PREFERENCE_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/projectCommon';
import { ActivityContactRole } from '@/utils/enums/projectCommon';
import { toNumber } from '@/utils/utils';
import { contactSchema } from '@/validators';

import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { ActivityContact, Contact } from '@/types';

// Types
interface ContactAndRole {
  contact: Contact;
  role: ActivityContactRole | undefined;
}

// Props
const { activityContacts } = defineProps<{
  activityContacts: ActivityContact[];
}>();

// Composables
const { t } = useI18n();
const { handleSubmit, resetForm } = useForm({
  validationSchema: contactSchema
});
const toast = useToast();

// Emits
const emit = defineEmits(['projectTeamAddModal:addUsers']);

// Store
const appStore = useAppStore();
const { isInternal } = storeToRefs(appStore);

// State
const contactSearchResults: Ref<Contact[]> = ref([]);
const hasSearched: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);
const manualEntry: Ref<boolean> = ref(false);
const searchTag: Ref<string> = ref('');
const selectedUser: Ref<Contact | undefined> = ref(undefined);
const selectedUsersAndRoles: Ref<ContactAndRole[]> = ref([]);
const showHasNoPrimaryError: Ref<boolean> = ref(false);
const visible = defineModel<boolean>('visible');

const addUserButtonDisabled = computed(
  () =>
    !selectedUser.value ||
    selectedUserExists.value ||
    selectedUsersAndRoles.value.some((sur) => sur.contact.contactId === selectedUser.value?.contactId)
);
const hasAllRolesAssigned = computed(() => selectedUsersAndRoles.value.every((sur) => sur.role));
const hasPrimaryActivityContact = computed(() =>
  activityContacts.some((ac) => ac.role === ActivityContactRole.PRIMARY)
);
const hasPrimaryContact = computed(
  () =>
    hasPrimaryActivityContact.value ||
    selectedUsersAndRoles.value.some((sur) => sur.role === ActivityContactRole.PRIMARY)
);
const isSearchDisabled = computed(() => {
  return loading.value || searchTag.value.trim().length < MIN_SEARCH_INPUT_LENGTH;
});
const manualEntryButtonLabel = computed(() =>
  manualEntry.value ? t('projectTeamAddModal.search') : t('projectTeamAddModal.manualEntry')
);
const selectableRoles = computed(() => {
  if (isInternal.value && !hasPrimaryActivityContact.value) {
    return ACTIVITY_CONTACT_ROLE_LIST;
  } else {
    return ACTIVITY_CONTACT_ROLE_LIST.filter((role) => role !== ActivityContactRole.PRIMARY);
  }
});
const selectedUserExists = computed(() =>
  activityContacts.some((ac) => ac.contactId === selectedUser.value?.contactId)
);

const searchMutex = new Mutex();

// Actions
function addUser(values: GenericObject) {
  if (manualEntry.value) {
    // Add manual contact and cast values since no contactId included
    selectedUsersAndRoles.value.push({ contact: { ...values } as Contact, role: undefined });
    manualEntry.value = false;
  } else if (selectedUser.value) {
    selectedUsersAndRoles.value.push({ contact: selectedUser.value, role: undefined });
  }

  selectedUser.value = undefined;
}

function onSave() {
  if (!hasPrimaryContact.value) {
    showHasNoPrimaryError.value = true;
    return;
  }

  emit('projectTeamAddModal:addUsers', selectedUsersAndRoles.value);
}

const onSubmit = handleSubmit((values) => {
  addUser(values);
});

function optionDisabled(option: string, data: ContactAndRole) {
  // Prevent non-users from being assigned ADMIN
  if (!data.contact.userId && option === ActivityContactRole.ADMIN) {
    return true;
  }

  if (option === ActivityContactRole.PRIMARY) {
    // If this specific row already has Primary selected, don't disable it
    if (data.role === ActivityContactRole.PRIMARY) return false;

    // Otherwise, disable Primary if one already exists in the project or list
    return hasPrimaryContact.value;
  }

  return false;
}

function removeUserFromSelectedByIndex(index: number) {
  selectedUsersAndRoles.value.splice(index, 1);
}

async function searchContacts() {
  if (isSearchDisabled.value) return;

  selectedUser.value = undefined;

  await searchMutex.runExclusive(async () => {
    try {
      loading.value = true;
      let contactSearchFilter;

      if (isInternal.value) {
        contactSearchFilter = toNumber(searchTag.value)
          ? { phoneNumber: searchTag.value }
          : { firstName: searchTag.value, lastName: searchTag.value, email: searchTag.value };
      } else {
        contactSearchFilter = { email: searchTag.value };
      }

      contactSearchResults.value = (await contactService.matchContacts(contactSearchFilter)).data;
    } catch (error) {
      toast.error(t('userCreateModal.searchError'), String(error));
    } finally {
      loading.value = false;
      // Set hasSearched to true if app is in internal zone
      hasSearched.value = isInternal.value;
    }
  });
}

watch(visible, () => {
  contactSearchResults.value = [];
  hasSearched.value = false;
  manualEntry.value = false;
  searchTag.value = '';
  selectedUser.value = undefined;
  selectedUsersAndRoles.value = [];
  showHasNoPrimaryError.value = false;

  resetForm();
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    class="app-info-dialog w-6/12"
    :pt="{
      header: { class: '!mb-1 !pb-0' }
    }"
    :draggable="false"
    :modal="true"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ isInternal ? t('projectTeamAddModal.headerNav') : t('projectTeamAddModal.headerProp') }}
      </span>
    </template>
    <Message
      v-if="selectedUserExists"
      class="text-center mt-2.5"
      severity="error"
      icon="pi pi-exclamation-circle"
    >
      {{ t('projectTeamAddModal.contactAlreadyExists') }}
    </Message>
    <div class="mb-5 mt-2.5">
      <p>{{ t('projectTeamAddModal.instructions') }}</p>
    </div>
    <div v-if="manualEntry">
      <form @submit="onSubmit">
        <div class="grid grid-cols-2 gap-x-5 gap-y-3 mx-10">
          <InputTextFormItem
            name="firstName"
            label="First name"
          />
          <InputTextFormItem
            name="lastName"
            label="Last name"
          />
          <SelectFormItem
            name="contactApplicantRelationship"
            label="Relationship to project"
            :options="PROJECT_RELATIONSHIP_LIST"
          />
          <SelectFormItem
            name="contactPreference"
            label="Preferred contact method"
            :options="CONTACT_PREFERENCE_LIST"
          />
          <InputMask
            name="phoneNumber"
            mask="(999) 999-9999"
            label="Contact phone"
          />
          <InputTextFormItem
            name="email"
            label="Contact email"
          />
        </div>
        <Button
          class="my-4 w-full"
          :label="t('projectTeamAddModal.addUser')"
          icon="pi pi-plus"
          type="submit"
        />
      </form>
    </div>
    <div v-else>
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="col-span-10">
          <IconField icon-position="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchTag"
              class="w-full"
              :placeholder="
                isInternal
                  ? t('projectTeamAddModal.searchPlaceholderNav')
                  : t('projectTeamAddModal.searchPlaceholderProp')
              "
              autofocus
              @keydown.enter="searchContacts"
            />
          </IconField>
        </div>
        <div class="col-span-2">
          <Button
            class="w-full"
            :label="t('projectTeamAddModal.search')"
            :disabled="isSearchDisabled"
            @click="searchContacts"
          />
        </div>
      </div>
      <DataTable
        v-model:selection="selectedUser"
        :row-hover="true"
        :loading="loading"
        class="datatable mt-4"
        :value="contactSearchResults"
        removable-sort
        selection-mode="single"
        data-key="contactId"
        :rows="5"
        :paginator="true"
      >
        <template #empty>
          <div class="flex justify-center">
            <h5 class="m-0">{{ t('projectTeamAddModal.empty') }}</h5>
          </div>
        </template>
        <template #loading>
          <Spinner />
        </template>
        <Column
          v-if="isInternal"
          field="userId"
          class="w-[1%] whitespace-nowrap"
        >
          <template #body="{ data }">
            <font-awesome-icon
              v-if="data.userId"
              icon="fa-solid fa-user"
              class="app-primary-color"
            />
          </template>
        </Column>
        <Column
          field="firstName"
          :header="t('projectTeamAddModal.headerFirstName')"
          sortable
        />
        <Column
          field="lastName"
          :header="t('projectTeamAddModal.headerLastName')"
          sortable
        />
        <Column
          v-if="isInternal"
          field="phoneNumber"
          :header="t('projectTeamAddModal.headerPhone')"
          sortable
        />
        <Column
          field="email"
          :header="t('projectTeamAddModal.headerEmail')"
          sortable
        />
      </DataTable>
      <Button
        class="my-4 w-full"
        :label="isInternal ? t('projectTeamAddModal.addUser') : t('projectTeamAddModal.addTeamMember')"
        icon="pi pi-plus"
        :disabled="addUserButtonDisabled"
        @click="addUser"
      />
    </div>
    <div v-if="selectedUsersAndRoles.length > 0">
      <h5 class="m-0">{{ t('projectTeamAddModal.selectedUsers') }}</h5>
      <Message
        v-if="showHasNoPrimaryError && !hasPrimaryContact"
        class="mt-2.5"
        severity="error"
        icon="pi pi-exclamation-circle"
      >
        <I18nT
          scope="global"
          keypath="projectTeamAddModal.onePrimaryRoleError"
          tag="span"
        >
          <template #one>
            <strong>{{ t('projectTeamAddModal.one') }}</strong>
          </template>
        </I18nT>
      </Message>
      <DataTable
        class="datatable mb-2 table-fixed"
        :value="selectedUsersAndRoles"
        size="small"
        :rows="selectedUsersAndRoles.length"
      >
        <Column
          v-if="isInternal"
          field="userId"
          class="w-[5%] whitespace-nowrap !pl-4 !pr-1 !py-1"
        >
          <template #body="{ data }">
            <font-awesome-icon
              v-if="data.contact.userId"
              icon="fa-solid fa-user"
              class="app-primary-color"
            />
          </template>
        </Column>
        <Column
          class="whitespace-nowrap !p-1"
          :class="isInternal ? 'w-[10%]' : 'w-[15%]'"
        >
          <template #body="{ data }">{{ data.contact.firstName }} {{ data.contact.lastName }}</template>
        </Column>
        <Column class="w-[60%] whitespace-nowrap !p-1">
          <template #body="{ data }">
            <div class="flex justify-center w-full">
              <Message
                v-if="data.role === ActivityContactRole.ADMIN"
                class="!m-0 !py-0 !px-0"
                severity="warn"
                :pt="{
                  content: { class: '!px-2.5 !py-2' }
                }"
              >
                {{ t('projectTeamAddModal.adminSelectedWarning') }}
              </Message>
            </div>
          </template>
        </Column>
        <Column
          field="role"
          class="w-[20%] whitespace-nowrap !p-1"
        >
          <template #body="{ data }">
            <Select
              v-model="data.role"
              class="w-full"
              name="assignRole"
              :pt="{
                label: { class: '!pl-1.5 !pr-0 !py-1.5' }
              }"
              :placeholder="t('projectTeamAddModal.assign')"
              :options="selectableRoles"
              :option-disabled="(option) => optionDisabled(option, data)"
            />
          </template>
        </Column>
        <Column
          field="remove"
          header-class="header-right"
          class="w-[5%] whitespace-nowrap !pl-0 !pr-2 !py-1"
        >
          <template #body="{ index }">
            <Button
              class="p-button-text p-button-danger"
              :aria-label="t('projectTeamAddModal.remove')"
              icon="pi pi-times"
              @click="() => removeUserFromSelectedByIndex(index)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="flex justify-between items-center mt-6">
      <div>
        <Button
          class="mr-2"
          :label="t('projectTeamAddModal.save')"
          type="submit"
          :disabled="selectedUsersAndRoles.length === 0 || !hasAllRolesAssigned"
          @click="onSave"
        />
        <Button
          class="p-button-outlined mr-2"
          :label="t('projectTeamAddModal.cancel')"
          @click="visible = false"
        />
      </div>
      <div>
        <Button
          v-if="hasSearched && isInternal"
          class="p-button-text"
          :aria-label="manualEntryButtonLabel"
          :label="manualEntryButtonLabel"
          @click="
            manualEntry = !manualEntry;
            selectedUser = undefined;
          "
        />
      </div>
    </div>
  </Dialog>
</template>
