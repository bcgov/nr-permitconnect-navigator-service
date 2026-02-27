<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, onBeforeMount, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { FormAutosave, FormNavigationGuard, StepperHeader, StepperNavigation } from '@/components/form';
import {
  ContactCardIntakeForm,
  NaturalDisasterCard,
  LocationCard,
  CollectionDisclaimer,
  RegisteredBusinessCard,
  ValidationBanner,
  ProjectNameCard,
  ProjectDescriptionCard,
  LocationAdditionalCard,
  LocationDescriptionCard,
  AppliedPermitsCard,
  PermitLearnCard,
  InvestigatePermitsCard,
  SaveDraftButton
} from '@/components/form/common';
import ProjectIntakeAssistance from '@/components/housing/project/ProjectIntakeAssistance.vue';
import { createProjectIntakeSchema } from '@/validators/general/projectIntakeFormSchema';
import { Button, Step, StepList, Stepper, StepPanel, StepPanels, useConfirm, useToast } from '@/lib/primevue';
import { generalProjectService } from '@/services';
import { useContactStore, useFormStore, useProjectStore } from '@/store';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitNeeded, PermitStage } from '@/utils/enums/permit';
import { ActivityContactRole, FormState, FormType, IntakeFormCategory } from '@/utils/enums/projectCommon';
import { generalErrorHandler } from '@/utils/utils';

import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type {
  DeepPartial,
  Draft,
  GeneralProject,
  GeneralProjectIntake,
  OrgBookOption,
  Permit,
  PermitTracking
} from '@/types';
import type { FormSchemaType } from '@/validators/general/projectIntakeFormSchema';

// Props
const { project = undefined } = defineProps<{
  project?: GeneralProject;
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
const { getEditable, getFormType, getFirstErrorTab } = storeToRefs(formStore);

// State
const activeStep: Ref<number> = ref(0);
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const isSubmittable: Ref<boolean> = ref(false);
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
const validationSchema = computed(() => {
  return createProjectIntakeSchema(orgBookOptions.value);
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
  activeStep.value = getFirstErrorTab.value;
  await nextTick();
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSaveDraft(data: GenericObject, isAutoSave = false, showToast = true) {
  try {
    autoSaveRef.value?.stopAutoSave();

    const response = await generalProjectService.upsertDraft({
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

    const payload: GeneralProjectIntake = {
      activityId: draft.value?.activityId,
      basic: {
        projectApplicantType: data.basic.projectApplicantType,
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
      location: {
        naturalDisaster: data.location.naturalDisaster,
        projectLocation: data.location.projectLocation,
        projectLocationDescription: data.location.projectLocationDescription,
        ltsaPidLookup: data.location.ltsaPidLookup,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        locality: data.location.locality,
        province: data.location.province,
        geomarkUrl: data.location.geomarkUrl
      },
      permits: {
        appliedPermits: data.permits.appliedPermits?.map((x) => ({
          submittedDate: x.submittedDate?.toISOString(),
          permitTracking: [{ trackingId: x.permitTracking?.[0]?.trackingId } as PermitTracking],
          permitTypeId: x.permitTypeId
        })),
        hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits,
        investigatePermits: data.permits.investigatePermits
      }
    };

    const response = await generalProjectService.submitDraft(payload);

    if (response.data.activityId && response.data.generalProjectId) {
      // TODO: Remove once user is forced to fill contact data out
      contactStore.setContact(response.data.contact);

      router.push({
        name: RouteName.EXT_GENERAL_INTAKE_CONFIRMATION,
        params: {
          projectId: response.data.generalProjectId
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
        ...draft.value.data,
        permits: {
          ...draft.value.data.permits,
          appliedPermits:
            draft.value.data.permits.appliedPermits?.map((x) => ({
              permitTypeId: x.permitTypeId,
              permitTracking: [
                {
                  trackingId: x.permitTracking?.[0]?.trackingId
                }
              ],
              submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
            })) ?? []
        }
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
          projectApplicantType: project.projectApplicantType,
          isDevelopedInBc: project.companyIdRegistered ? BasicResponse.YES : BasicResponse.NO,
          registeredName: project.companyNameRegistered,
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
        location: {
          naturalDisaster: project.naturalDisaster ? BasicResponse.YES : BasicResponse.NO,
          projectLocation: project.projectLocation,
          streetAddress: project.streetAddress,
          locality: project.locality,
          province: project.province,
          latitude: project.latitude,
          longitude: project.longitude,
          ltsaPidLookup: project.locationPids,
          geomarkUrl: project.geomarkUrl,
          projectLocationDescription: project?.projectLocationDescription,
          geoJson: project.geoJson
        },
        permits: {
          appliedPermits: useProjectStore()
            .getPermits.filter((x: Permit) => x.stage === PermitStage.APPLICATION_SUBMISSION)
            .map((x: Permit) => ({
              ...x,
              submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
            })),
          hasAppliedProvincialPermits: project.hasAppliedProvincialPermits ? BasicResponse.YES : BasicResponse.NO,
          investigatePermits: useProjectStore().getPermits.filter(
            (x: Permit) => x.needed === PermitNeeded.UNDER_INVESTIGATION
          )
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
    router.replace({ name: RouteName.EXT_GENERAL });
  }
});

watch(activeStep, () => {
  if (activeStep.value === 3) isSubmittable.value = true;
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    id="form"
    v-slot="{ values }"
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
    <ProjectIntakeAssistance v-if="getEditable && values?.contacts" />

    <Stepper :value="activeStep">
      <StepList class="!mb-6">
        <Step
          :value="0"
          as-child
        >
          <StepperHeader
            v-model:active-step="activeStep"
            :index="0"
            :title="t('projectIntakeForm.headers.basic')"
            icon="fa-user"
            :error-categories="[IntakeFormCategory.CONTACTS, IntakeFormCategory.BASIC]"
          />
        </Step>
        <Step
          :value="1"
          as-child
        >
          <StepperHeader
            v-model:active-step="activeStep"
            :index="1"
            :title="t('projectIntakeForm.headers.project')"
            icon="fa-house"
            :error-categories="[IntakeFormCategory.BASIC]"
            @click-callback="
              () => {
                // Force an autosave to get an activity ID for file uploads
                if (getFormType === FormType.NEW) {
                  onSaveDraft(values, true, false);
                }
              }
            "
          />
        </Step>
        <Step
          :value="2"
          as-child
        >
          <StepperHeader
            v-model:active-step="activeStep"
            :index="2"
            :title="t('projectIntakeForm.headers.location')"
            icon="fa-location-dot"
            :error-categories="[IntakeFormCategory.LOCATION]"
          />
        </Step>
        <Step
          :value="3"
          as-child
        >
          <StepperHeader
            v-model:active-step="activeStep"
            :index="3"
            :title="t('projectIntakeForm.headers.permits')"
            icon="fa-file"
            :error-categories="[IntakeFormCategory.PERMITS]"
            :divider="false"
          />
        </Step>
      </StepList>

      <!-- Basic -->
      <StepPanels>
        <StepPanel :value="0">
          <CollectionDisclaimer />
          <ValidationBanner />
          <ContactCardIntakeForm
            :initial-form-values="initialFormValues.contacts"
            :tab="0"
          />
          <RegisteredBusinessCard
            v-model:org-book-options="orgBookOptions"
            :tab="0"
          />
          <StepperNavigation
            v-model:active-step="activeStep"
            :prev-disabled="true"
          >
            <template #content>
              <SaveDraftButton @click-callback="onSaveDraft" />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Project -->
        <StepPanel :value="1">
          <ValidationBanner />
          <ProjectNameCard :tab="1" />
          <ProjectDescriptionCard
            :activity-id="draft?.activityId ?? project?.activityId"
            :tab="1"
            :tooltip="true"
          />
          <StepperNavigation v-model:active-step="activeStep">
            <template #content>
              <SaveDraftButton @click-callback="onSaveDraft" />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Location -->
        <StepPanel :value="2">
          <ValidationBanner />
          <NaturalDisasterCard :tab="2" />
          <LocationCard
            :active-step="activeStep"
            :tab="2"
          />
          <LocationAdditionalCard :tab="2" />
          <LocationDescriptionCard :tab="2" />
          <StepperNavigation v-model:active-step="activeStep">
            <template #content>
              <SaveDraftButton @click-callback="onSaveDraft" />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Permits & Reports -->
        <StepPanel :value="3">
          <ValidationBanner />
          <AppliedPermitsCard :tab="3" />
          <PermitLearnCard />
          <InvestigatePermitsCard :tab="3" />
          <StepperNavigation
            v-model:active-step="activeStep"
            :next-disabled="true"
          >
            <template #content>
              <SaveDraftButton @click-callback="onSaveDraft" />
            </template>
          </StepperNavigation>
        </StepPanel>
      </StepPanels>
    </Stepper>
    <div class="flex items-center justify-center mt-6">
      <Button
        :label="t('ui.actions.submit')"
        type="submit"
        icon="pi pi-upload"
        :disabled="!getEditable || !isSubmittable"
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
