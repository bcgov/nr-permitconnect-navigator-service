<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object, type InferType } from 'yup';

import { FormNavigationGuard } from '@/components/form';
import CancelButton from '@/components/form/CancelButton.vue';
import { AppliedPermitsCard } from '@/components/form/common';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { electrificationProjectService, generalProjectService, housingProjectService, permitService } from '@/services';
import { useAppStore, useFormStore, useProjectStore } from '@/store';
import { generalErrorHandler } from '@/utils/utils';
import { Initiative, RouteName } from '@/utils/enums/application';
import { FormState } from '@/utils/enums/projectCommon';
import { appliedPermitsValidator } from '@/validators/common';

import type { GenericObject } from 'vee-validate';
import type { IntakePermitRequest, Project, ProjectService } from '@/types';

// Props
const { projectId } = defineProps<{
  projectId: string;
}>();

// Interfaces
interface InitiativeState {
  projectRouteName: RouteName;
  projectService: ProjectService<Project>;
}

// Types
type FormSchemaType = InferType<typeof FORM_SCHEMA>;

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  projectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT,
  projectService: electrificationProjectService
};

const GENERAL_INITIATIVE_STATE: InitiativeState = {
  projectRouteName: RouteName.EXT_GENERAL_PROJECT,
  projectService: generalProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  projectRouteName: RouteName.EXT_HOUSING_PROJECT,
  projectService: housingProjectService
};

const FORM_SCHEMA = object({
  permits: object({
    appliedPermits: appliedPermitsValidator.min(1).required()
  })
});

// Composables
const confirm = useConfirm();
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const projectStore = useProjectStore();
const { getProject } = storeToRefs(projectStore);
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);

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

function onCancel() {
  router.push({
    name: initiativeState.value.projectRouteName,
    params: {
      projectId
    }
  });
}

async function onInvalidSubmit() {
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSubmit(data: FormSchemaType) {
  try {
    formStore.setFormState(FormState.LOCKED);

    if (!data.permits.appliedPermits) throw new Error('No permits');
    if (!getProject.value) throw new Error('No activity');

    const payload: IntakePermitRequest[] = data.permits.appliedPermits.map((x) => ({
      activityId: getProject.value!.activityId,
      permitTypeId: x.permitTypeId,
      trackingId: x.permitTracking?.[0]?.trackingId,
      submittedDate: x.submittedDate?.toISOString()
    }));

    await permitService.intakePermits(payload);

    toast.success(
      payload.length > 1 ? t('views.e.permitAddView.success.multiple') : t('views.e.permitAddView.success.single')
    );
    router.push({
      name: initiativeState.value.projectRouteName,
      params: {
        projectId
      }
    });
  } catch (e) {
    generalErrorHandler(e, t('projectIntakeForm.submit.saveFailed'), undefined, toast);
    formStore.setFormState(FormState.UNLOCKED);
  }
}

onMounted(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.GENERAL:
        initiativeState.value = GENERAL_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    try {
      const project = await initiativeState.value.projectService.getProject({ projectId });
      projectStore.setProject(project);
      formStore.setFormState(FormState.UNLOCKED);
    } catch {
      toast.error(t('views.e.projectView.toastProjectLoadFailed'));
      router.replace({ name: initiativeState.value.projectRouteName, params: { projectId } });
      return;
    }
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div v-if="getProject">
    <h1 class="app-primary-color mt-10 mb-2">
      {{ getProject?.projectName }}
    </h1>

    <Form
      id="form"
      v-slot="{ meta }"
      :validation-schema="FORM_SCHEMA"
      @invalid-submit="onInvalidSubmit"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard v-if="getEditable" />

      <AppliedPermitsCard
        :default-row="{
          permitTypeId: undefined,
          trackingId: undefined,
          submittedDate: undefined
        }"
        :header="t('views.e.permitAddView.appliedPermitsHeader')"
      />

      <div class="flex items-center justify-end mt-6 gap-x-2">
        <Button
          :label="t('ui.actions.submit')"
          type="submit"
          icon="pi pi-upload"
          :disabled="!getEditable || !meta.dirty"
        />
        <CancelButton
          :can-disable="false"
          :editable="getEditable"
          @clicked="onCancel"
        />
      </div>
    </Form>
  </div>
</template>
