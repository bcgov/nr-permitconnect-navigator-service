<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onBeforeMount, nextTick, ref, watchEffect } from 'vue';
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
  FeedbackConsentCard
} from '@/components/form/common';
import ProjectIntakeAssistance from '@/components/housing/project/ProjectIntakeAssistance.vue';
import { createProjectIntakeSchema } from '@/validators/general/projectIntakeFormSchema';
import { Button, Step, StepList, Stepper, StepPanel, StepPanels, useConfirm, useToast } from '@/lib/primevue';
import { generalProjectService } from '@/services';
import { useContactStore, useProjectStore } from '@/store';

import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitNeeded, PermitStage } from '@/utils/enums/permit';
import { ActivityContactRole, IntakeFormCategory, IntakeState, IntakeType } from '@/utils/enums/projectCommon';
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
const { project = undefined, editable } = defineProps<{
  project?: GeneralProject;
  editable: boolean;
}>();

const draft = defineModel<Draft<FormSchemaType>>('draft');
const intakeState = defineModel<IntakeState>('intakeState');
const intakeType = defineModel<IntakeType>('intakeType');

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

// Store
const contactStore = useContactStore();

// State
const activeStep: Ref<number> = ref(0);
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const isSubmittable: Ref<boolean> = ref(false);
const locationRef: Ref<InstanceType<typeof LocationCard> | null> = ref(null);
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
const validationErrors = computed(() => {
  // Parse errors from vee-validate into a string[] of category headings
  if (!formRef?.value?.errors) return [];
  else return Array.from(new Set(Object.keys(formRef.value.errors).flatMap((x) => x.split('.')[0]!.split('[')[0])));
});
const validationSchema = computed(() => {
  return createProjectIntakeSchema(orgBookOptions.value);
});

// Actions
function confirmSubmit(data: GenericObject) {
  confirm.require({
    message: 'Are you sure you wish to submit this form?',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => onSubmit(data as FormSchemaType)
  });
}

async function onInvalidSubmit() {
  switch (validationErrors.value[0]) {
    case IntakeFormCategory.CONTACTS:
    case IntakeFormCategory.BASIC:
      activeStep.value = 0;
      break;

    case IntakeFormCategory.GENERAL:
      activeStep.value = 1;
      break;

    case IntakeFormCategory.LOCATION:
      activeStep.value = 2;
      break;

    case IntakeFormCategory.PERMITS:
    case IntakeFormCategory.APPLIED_PERMITS:
    case IntakeFormCategory.INVESTIGATE_PERMIS:
      activeStep.value = 3;
      break;
  }

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
    intakeType.value = IntakeType.DRAFT;

    router.replace({
      params: { draftId: response.data.draftId }
    });

    if (showToast) toast.success(isAutoSave ? 'Draft autosaved' : 'Draft saved');
  } catch (e) {
    generalErrorHandler(e, 'Failed to save draft', undefined, toast);
  }
}

async function onSubmit(data: FormSchemaType) {
  intakeState.value = IntakeState.LOCKED;

  try {
    autoSaveRef.value?.stopAutoSave();

    const payload: GeneralProjectIntake = {
      basic: {
        consentToFeedback: data.basic.consentToFeedback,
        projectApplicantType: data.basic.projectApplicantType,
        registeredId: data.basic.registeredId,
        registeredName: data.basic.registeredName
      },

      general: {
        projectName: data.general.projectName,
        projectDescription: data.general.projectDescription
      },

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
        hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
      },

      appliedPermits: data.appliedPermits?.map((x) => ({
        submittedDate: x.submittedDate?.toISOString(),
        permitTracking: [{ trackingId: x.permitTracking?.[0]?.trackingId } as PermitTracking],
        permitTypeId: x.permitTypeId
      })),

      investigatePermits: data.investigatePermits,

      contact: {
        contactId: data.contacts.contactId,
        firstName: data.contacts.contactFirstName,
        lastName: data.contacts.contactLastName,
        email: data.contacts.contactEmail,
        phoneNumber: data.contacts.contactPhoneNumber,
        contactApplicantRelationship: data.contacts.contactApplicantRelationship,
        contactPreference: data.contacts.contactPreference
      },

      activityId: draft.value?.activityId,
      draftId: draft.value?.draftId
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
      throw new Error('Failed to retrieve correct draft data');
    }
  } catch (e) {
    generalErrorHandler(e, 'Failed to save intake', undefined, toast);
    intakeState.value = IntakeState.UNLOCKED;
  }
}

onBeforeMount(async () => {
  try {
    if (draft.value && project) throw new Error('Draft & Project supplied');

    if (draft.value) {
      initialFormValues.value = {
        ...draft.value.data,
        appliedPermits:
          draft.value.data.appliedPermits?.map((x) => ({
            permitTypeId: x.permitTypeId,
            permitTracking: [
              {
                trackingId: x.permitTracking?.[0]?.trackingId
              }
            ],
            submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
          })) ?? []
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
        contacts: {
          contactFirstName: primaryContact?.firstName,
          contactLastName: primaryContact?.lastName,
          contactPhoneNumber: primaryContact?.phoneNumber,
          contactEmail: primaryContact?.email,
          contactApplicantRelationship: primaryContact?.contactApplicantRelationship,
          contactPreference: primaryContact?.contactPreference,
          contactId: primaryContact?.contactId
        },
        basic: {
          consentToFeedback: project.consentToFeedback,
          projectApplicantType: project.projectApplicantType,
          isDevelopedInBc: project.companyIdRegistered ? BasicResponse.YES : BasicResponse.NO,
          registeredName: project.companyNameRegistered
        },
        general: {
          projectName: project.projectName,
          projectDescription: project.projectDescription
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
        appliedPermits: useProjectStore()
          .getPermits.filter((x: Permit) => x.stage === PermitStage.APPLICATION_SUBMISSION)
          .map((x: Permit) => ({
            ...x,
            submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
          })),
        permits: {
          hasAppliedProvincialPermits: project.hasAppliedProvincialPermits ? BasicResponse.YES : BasicResponse.NO
        },
        investigatePermits: useProjectStore().getPermits.filter(
          (x: Permit) => x.needed === PermitNeeded.UNDER_INVESTIGATION
        )
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

    locationRef.value?.onLatLongInput();
  } catch (e) {
    generalErrorHandler(e, 'Failed to load intake');
    router.replace({ name: RouteName.EXT_GENERAL });
  }
});

watchEffect(() => {
  // Map component misaligned if mounted while not visible. Trigger resize to fix on show
  if (activeStep.value === 2) nextTick().then(() => locationRef?.value?.resizeMap());
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
      v-if="editable"
      :auto-save-ref="autoSaveRef"
    />
    <FormAutosave
      v-if="editable"
      ref="autoSaveRef"
      :callback="() => onSaveDraft(values, true)"
    />
    <ProjectIntakeAssistance v-if="editable && values?.contacts" />

    <Stepper :value="activeStep">
      <StepList class="!mb-6">
        <Step
          :value="0"
          as-child
        >
          <StepperHeader
            :index="0"
            :active-step="activeStep"
            :click-callback="() => (activeStep = 0)"
            title="Basic info"
            icon="fa-user"
            :errors="
              validationErrors.includes(IntakeFormCategory.CONTACTS) ||
              validationErrors.includes(IntakeFormCategory.BASIC)
            "
          />
        </Step>
        <Step
          :value="1"
          as-child
        >
          <StepperHeader
            :index="1"
            :active-step="activeStep"
            :click-callback="() => (activeStep = 1)"
            title="Project"
            icon="fa-house"
            :errors="validationErrors.includes(IntakeFormCategory.GENERAL)"
          />
        </Step>
        <Step
          :value="2"
          as-child
        >
          <StepperHeader
            :index="2"
            :active-step="activeStep"
            :click-callback="() => (activeStep = 2)"
            title="Location"
            icon="fa-location-dot"
            :errors="validationErrors.includes(IntakeFormCategory.LOCATION)"
          />
        </Step>
        <Step
          :value="3"
          as-child
        >
          <StepperHeader
            :index="3"
            :active-step="activeStep"
            :click-callback="() => (activeStep = 3)"
            title="Permits & Reports"
            icon="fa-file"
            :errors="
              validationErrors.includes(IntakeFormCategory.PERMITS) ||
              validationErrors.includes(IntakeFormCategory.APPLIED_PERMITS)
            "
            :divider="false"
          />
        </Step>
      </StepList>

      <!-- Basic -->
      <StepPanels>
        <StepPanel :value="0">
          <CollectionDisclaimer />
          <ValidationBanner :validation-errors="validationErrors" />
          <ContactCardIntakeForm
            :editable="editable"
            :initial-form-values="initialFormValues"
          />
          <RegisteredBusinessCard
            v-model:org-book-options="orgBookOptions"
            :editable="editable"
          />
          <StepperNavigation
            :editable="editable"
            :next-callback="() => activeStep++"
            :prev-disabled="true"
          >
            <template #content>
              <Button
                class="p-button-sm"
                outlined
                label="Save draft"
                :disabled="!editable"
                @click="onSaveDraft(values)"
              />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Project -->
        <StepPanel :value="1">
          <ValidationBanner :validation-errors="validationErrors" />
          <ProjectNameCard :editable="editable" />
          <ProjectDescriptionCard
            :activity-id="draft?.activityId ?? project?.activityId"
            :editable="editable"
          />
          <StepperNavigation
            :editable="editable"
            :next-callback="() => activeStep++"
            :prev-callback="() => activeStep--"
          >
            <template #content>
              <Button
                class="p-button-sm"
                outlined
                label="Save draft"
                :disabled="!editable"
                @click="onSaveDraft(values)"
              />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Location -->
        <StepPanel :value="2">
          <ValidationBanner :validation-errors="validationErrors" />
          <NaturalDisasterCard :editable="editable" />
          <LocationCard
            ref="locationRef"
            :editable="editable"
          />
          <LocationAdditionalCard :editable="editable" />
          <LocationDescriptionCard :editable="editable" />
          <StepperNavigation
            :editable="editable"
            :next-callback="() => activeStep++"
            :prev-callback="() => activeStep--"
          >
            <template #content>
              <Button
                class="p-button-sm"
                outlined
                label="Save draft"
                :disabled="!editable"
                @click="onSaveDraft(values)"
              />
            </template>
          </StepperNavigation>
        </StepPanel>

        <!-- Permits & Reports -->
        <StepPanel :value="3">
          <ValidationBanner :validation-errors="validationErrors" />
          <AppliedPermitsCard :editable="editable" />
          <PermitLearnCard :editable="editable" />
          <InvestigatePermitsCard :editable="editable" />
          <FeedbackConsentCard :editable="editable" />
          <StepperNavigation
            :editable="editable"
            :next-disabled="true"
            :prev-callback="() => activeStep--"
          >
            <template #content>
              <Button
                class="p-button-sm"
                outlined
                label="Save draft"
                :disabled="!editable"
                @click="onSaveDraft(values)"
              />
            </template>
          </StepperNavigation>
        </StepPanel>
      </StepPanels>
    </Stepper>
    <div class="flex items-center justify-center mt-6">
      <Button
        label="Submit"
        type="submit"
        icon="pi pi-upload"
        :disabled="!editable || !isSubmittable"
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
