<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { default as ElectrificationProjectIntakeForm } from '@/components/electrification/project/ProjectIntakeForm.vue';
import { default as GeneralProjectIntakeForm } from '@/components/general/project/ProjectIntakeForm.vue';
import { default as HousingProjectIntakeForm } from '@/components/housing/project/ProjectIntakeForm.vue';
import { documentService, generalProjectService, permitService } from '@/services';
import { useAppStore, useFormStore, usePermitStore, useProjectStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Document, Draft, GeneralProject } from '@/types';
import type { FormSchemaType } from '@/validators/general/projectIntakeFormSchema';

// Props
const { draftId = undefined, projectId = undefined } = defineProps<{
  draftId?: string;
  projectId?: string;
}>();

// Interfaces
interface InitiativeState {
  headerText: string;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  headerText: 'Electrification Project Intake Form'
};

const GENERAL_INITIATIVE_STATE: InitiativeState = {
  headerText: 'General Project Intake Form'
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  headerText: 'Housing Project Intake Form'
};

// Composables
const { t } = useI18n();
const route = useRoute();

// Store
const formStore = useFormStore();
const projectStore = useProjectStore();
const { getInitiative } = storeToRefs(useAppStore());

// State
const draft: Ref<Draft<FormSchemaType> | undefined> = ref(undefined);
const project: Ref<GeneralProject | undefined> = ref(undefined);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const loading: Ref<boolean> = ref(true);

// Actions

/**
 * Load data for a draft submission
 **/
async function loadDraft() {
  if (!draftId) throw new Error('No draft ID');

  draft.value = (await generalProjectService.getDraft(draftId)).data;

  const documents = (await documentService.listDocuments(draft.value.activityId)).data;
  documents.forEach((d: Document) => {
    d.filename = decodeURI(d.filename);
  });
  projectStore.setDocuments(documents);

  formStore.setFormType(FormType.DRAFT);
  formStore.setFormState(FormState.UNLOCKED);
}

/**
 * Load data for a submitted project
 **/
async function loadProject() {
  if (!projectId) throw new Error('No project ID');

  project.value = (await generalProjectService.getProject(projectId)).data;

  const documents = (await documentService.listDocuments(project.value.activityId)).data;
  documents.forEach((d: Document) => {
    d.filename = decodeURI(d.filename);
  });
  projectStore.setDocuments(documents);

  const permits = (await permitService.listPermits({ activityId: project.value.activityId })).data;
  projectStore.setPermits(permits);

  // Disallow form editing for submitted intake
  formStore.setFormType(FormType.SUBMISSION);
  formStore.setFormState(FormState.LOCKED);
}

/**
 * Load data for new submission
 **/
async function loadNewSubmission() {
  formStore.setFormType(FormType.NEW);
  formStore.setFormState(FormState.UNLOCKED);
}

onBeforeMount(async () => {
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

    // Clear certain store data on load
    projectStore.setDocuments([]);

    if (draftId) {
      await loadDraft();
    } else if (projectId) {
      await loadProject();
    } else {
      await loadNewSubmission();
    }

    usePermitStore().setPermitTypes((await permitService.getPermitTypes(getInitiative.value)).data);

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <div class="flex justify-center">
      <h2
        role="heading"
        aria-level="1"
      >
        {{ initiativeState.headerText }}
      </h2>
    </div>

    <div v-if="!loading">
      <ElectrificationProjectIntakeForm
        v-if="getInitiative === Initiative.ELECTRIFICATION"
        :key="route.fullPath"
        :draft-id="draftId"
        :electrification-project-id="projectId"
      />
      <GeneralProjectIntakeForm
        v-if="getInitiative === Initiative.GENERAL"
        v-model:draft="draft"
        :project="project"
      />
      <HousingProjectIntakeForm
        v-if="getInitiative === Initiative.HOUSING"
        :key="route.fullPath"
        :draft-id="draftId"
        :housing-project-id="projectId"
      />
    </div>
  </div>
</template>
