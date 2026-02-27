<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { FormAutosave, FormNavigationGuard } from '@/components/form';
import {
  BcHydroNumberCard,
  CollectionDisclaimer,
  ContactCardIntakeForm,
  ProjectDescriptionCard,
  ProjectNameCard,
  ProjectTypeCard,
  RegisteredBusinessCard,
  ValidationBanner
} from '@/components/form/common';
import { createProjectIntakeSchema } from '@/validators/electrification/projectIntakeFormSchema';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { electrificationProjectService } from '@/services';
import { useCodeStore, useContactStore, useFormStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { generalErrorHandler } from '@/utils/utils';

import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { DeepPartial, Draft, ElectrificationProject, ElectrificationProjectIntake, OrgBookOption } from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';
import { ActivityContactRole, FormState, FormType } from '@/utils/enums/projectCommon';

// Props
const { project = undefined } = defineProps<{
  project?: ElectrificationProject;
}>();

const draft = defineModel<Draft<FormSchemaType>>('draft');

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

// Store
const contactStore = useContactStore();
const formStore = useFormStore();
const { codeList, enums } = useCodeStore();
const { getEditable } = storeToRefs(formStore);

// State
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
const validationSchema = computed(() => {
  return createProjectIntakeSchema(codeList, enums, orgBookOptions.value);
});

// Actions
function confirmSubmit(data: GenericObject) {
  confirm.require({
    message: t('projectIntakeForm.submit.message'),
    header: t('projectIntakeForm.submit.header'),
    acceptLabel: t('ui.actions.confirm'),
    rejectLabel: t('ui.actions.cancel'),
    rejectProps: { outlined: true },
    accept: () => onSubmit(data as FormSchemaType)
  });
}

async function onInvalidSubmit() {
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSaveDraft(data: GenericObject, isAutoSave = false, showToast = true) {
  try {
    autoSaveRef.value?.stopAutoSave();

    const response = await electrificationProjectService.upsertDraft({
      draftId: draft.value?.draftId,
      activityId: draft.value?.activityId,
      data: data as FormSchemaType
    });

    draft.value = response.data;
    formStore.setFormType(FormType.DRAFT);

    router.replace({
      params: { draftId: response.data.draftId }
    });

    if (showToast)
      toast.success(isAutoSave ? t('projectIntakeForm.draft.autoSaved') : t('projectIntakeForm.draft.saved'));
  } catch (e) {
    generalErrorHandler(e, t('projectIntakeForm.draft.saveFailed'), undefined, toast);
  }
}

async function onSubmit(data: FormSchemaType) {
  formStore.setFormState(FormState.LOCKED);

  try {
    autoSaveRef.value?.stopAutoSave();

    const payload: ElectrificationProjectIntake = {
      activityId: draft.value?.activityId,
      basic: {
        registeredId: data.basic.registeredId,
        registeredName: data.basic.registeredName,
        projectName: data.basic.projectName,
        projectDescription: data.basic.projectDescription
      },
      contact: {
        contactId: data.contacts.contactId,
        firstName: data.contacts.contactFirstName,
        lastName: data.contacts.contactLastName,
        email: data.contacts.contactEmail,
        phoneNumber: data.contacts.contactPhoneNumber,
        contactApplicantRelationship: data.contacts.contactApplicantRelationship,
        contactPreference: data.contacts.contactPreference
      },
      draftId: draft.value?.draftId,
      project: {
        bcHydroNumber: data.project.bcHydroNumber,
        projectType: data.project.projectType
      }
    };

    const response = await electrificationProjectService.submitDraft(payload);

    if (response.data.activityId && response.data.electrificationProjectId) {
      // TODO: Remove once user is forced to fill contact data out
      contactStore.setContact(response.data.contact);

      router.push({
        name: RouteName.EXT_ELECTRIFICATION_INTAKE_CONFIRMATION,
        params: {
          projectId: response.data.electrificationProjectId
        }
      });
    } else {
      throw new Error(t('projectIntakeForm.submit.badResponse'));
    }
  } catch (e) {
    generalErrorHandler(e, t('projectIntakeForm.submit.saveFailed'), undefined, toast);
    formStore.setFormState(FormState.UNLOCKED);
  }
}

onBeforeMount(async () => {
  try {
    if (draft.value && project) throw new Error(t('projectIntakeForm.load.tooManyProps'));

    if (draft.value) {
      initialFormValues.value = {
        ...draft.value.data
      };

      // Load org book option if company name is already filled
      if (draft.value.data.basic?.registeredId && draft.value.data.basic?.registeredName) {
        orgBookOptions.value = [
          { registeredId: draft.value.data.basic.registeredId, registeredName: draft.value.data.basic.registeredName }
        ];
      }
    } else if (project) {
      const primaryContact = project
        ? project.activity?.activityContact?.find((x) => x.role === ActivityContactRole.PRIMARY)?.contact
        : useContactStore().getContact;

      initialFormValues.value = {
        basic: {
          registeredName: project.companyNameRegistered,
          registeredId: project.companyIdRegistered,
          projectName: project.projectName,
          projectDescription: project.projectDescription
        },
        contacts: {
          contactFirstName: primaryContact?.firstName,
          contactLastName: primaryContact?.lastName,
          contactPhoneNumber: primaryContact?.phoneNumber,
          contactEmail: primaryContact?.email,
          contactApplicantRelationship: primaryContact?.contactApplicantRelationship,
          contactPreference: primaryContact?.contactPreference,
          contactId: primaryContact?.contactId
        },
        project: {
          bcHydroNumber: project.bcHydroNumber,
          projectType: project.projectType
        }
      };
    } else {
      const userContact = useContactStore().getContact;
      initialFormValues.value = {
        contacts: {
          contactId: userContact?.contactId,
          contactFirstName: userContact?.firstName,
          contactLastName: userContact?.lastName,
          contactEmail: userContact?.email,
          contactPhoneNumber: userContact?.phoneNumber,
          contactApplicantRelationship: userContact?.contactApplicantRelationship,
          contactPreference: userContact?.contactPreference
        }
      };
    }
  } catch (e) {
    generalErrorHandler(e, t('projectIntakeForm.load.failed'));
    router.replace({ name: RouteName.EXT_ELECTRIFICATION });
  }
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    id="form"
    v-slot="{ isSubmitting, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="validationSchema"
    @invalid-submit="onInvalidSubmit"
    @submit="confirmSubmit"
  >
    <FormNavigationGuard
      v-if="getEditable"
      :auto-save-ref="autoSaveRef"
    />
    <FormAutosave
      v-if="getEditable"
      ref="autoSaveRef"
      :callback="() => onSaveDraft(values, true)"
    />
    <CollectionDisclaimer />
    <ValidationBanner />
    <ContactCardIntakeForm :initial-form-values="initialFormValues.contacts" />
    <RegisteredBusinessCard
      v-model:org-book-options="orgBookOptions"
      :compact="true"
    />
    <ProjectNameCard />
    <ProjectTypeCard />
    <BcHydroNumberCard />
    <ProjectDescriptionCard :activity-id="draft?.activityId ?? project?.activityId" />

    <div class="flex items-center justify-center mt-6">
      <Button
        :label="t('ui.actions.submit')"
        type="submit"
        icon="pi pi-upload"
        :disabled="!getEditable || isSubmitting"
      />
    </div>
  </Form>
</template>

<style scoped lang="scss">
:deep(.p-step) {
  button {
    padding: 0;
  }
}

:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: var(--p-red-500) !important;
}
</style>
