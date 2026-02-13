<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { Form, type GenericObject } from 'vee-validate';
import { computed, inject, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { array, boolean, number, object, string, type InferType } from 'yup';

import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import AuthorizationStatusUpdatesCard from '@/components/authorization/AuthorizationStatusUpdatesCard.vue';
import AuthorizationUpdateHistory from '@/components/authorization/AuthorizationUpdateHistory.vue';
import { FormNavigationGuard } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { peachService, permitService, sourceSystemKindService, userService } from '@/services';
import { useCodeStore, useFeatureStore, useProjectStore } from '@/store';
import { PERMIT_NEEDED_LIST, PERMIT_STAGE_LIST, PERMIT_STATE_LIST } from '@/utils/constants/permit';
import { PermitNeeded, PermitStage, PermitState } from '@/utils/enums/permit';
import { formatDateTime } from '@/utils/formatters';
import { projectRouteNameKey } from '@/utils/keys';
import { combineDateTime, omit, scrollToFirstError, setEmptyStringsToNull, splitDateTime } from '@/utils/utils';
import { notInFutureValidator } from '@/validators/common';

import type { Ref } from 'vue';
import type { Permit, PermitTracking, PermitType, SourceSystemKind, User } from '@/types';
import type { IStamps } from '@/interfaces';
import type { PermitArgs } from '@/types/Permit';

// Props
const { authorization = undefined, editable } = defineProps<{
  authorization?: Permit;
  editable?: boolean;
}>();

// Constants
const AUTHORIZATION_TAB = '2';

// Composables
const codeStore = useCodeStore();
const confirmDialog = useConfirm();
const featureStore = useFeatureStore();
const { locale, t } = useI18n();
const projectStore = useProjectStore();
const router = useRouter();
const toast = useToast();

// Types
const formSchema = object({
  permitNote: string()
    .when('stage', {
      is: (stage: string) => stage !== initialFormValues.value?.stage,
      then: (schema) => schema.required(t('authorization.authorizationForm.noteRequired'))
    })
    .when('state', {
      is: (state: string) => state !== initialFormValues.value?.state,
      then: (schema) => schema.required(t('authorization.authorizationForm.noteRequired'))
    }),
  authorizationType: object().required().label(t('authorization.authorizationForm.authorizationType')),
  needed: string()
    .required()
    .oneOf(PERMIT_NEEDED_LIST)
    .label(t('authorization.authorizationForm.needed'))
    .test('valid-needed', t('authorization.authorizationForm.neededCondition'), function (value) {
      const { state } = this.parent;
      return (
        (value === PermitNeeded.UNDER_INVESTIGATION && state === PermitState.NONE) ||
        value !== PermitNeeded.UNDER_INVESTIGATION
      );
    }),
  stage: string().required().oneOf(PERMIT_STAGE_LIST).label(t('authorization.authorizationForm.applicationStage')),
  issuedPermitId: string().nullable(),
  permitId: string(),
  permitTracking: array().of(
    object({
      sourceSystemKindId: number().label(t('authorization.authorizationForm.trackingIdType')),
      trackingId: string().max(255).label(t('authorization.authorizationForm.trackingId')),
      shownToProponent: boolean()
        .oneOf([true, false])
        .default(false)
        .label(t('authorization.authorizationForm.shownToProponent'))
    })
  ),
  state: string()
    .required()
    .oneOf(PERMIT_STATE_LIST)
    .label(t('authorization.authorizationForm.authorizationStatus'))
    .test('valid-stage', t('authorization.authorizationForm.authStatusConditionNewNone'), function (value) {
      const { stage } = this.parent;
      return (
        (stage === PermitStage.PRE_SUBMISSION && value === PermitState.NONE) ||
        (stage !== PermitStage.PRE_SUBMISSION && value !== PermitState.NONE)
      );
    })
    .test('valid-stage', t('authorization.authorizationForm.authStatusConditionInProPre'), function (value) {
      const { stage } = this.parent;
      return stage !== PermitStage.POST_DECISION || value !== PermitState.IN_PROGRESS;
    }),
  submittedDate: notInFutureValidator.nullable().label(t('authorization.authorizationForm.submittedDate')),
  decisionDate: notInFutureValidator.nullable().label(t('authorization.authorizationForm.decisionDate')),
  statusLastVerified: notInFutureValidator.nullable().label(t('authorization.authorizationForm.statusLastVerified')),
  statusLastChanged: notInFutureValidator.nullable().label(t('authorization.authorizationForm.statusLastChanged'))
});

type FormSchemaType = InferType<typeof formSchema> & { authorizationType: PermitType } & IStamps;

// Store
const { codeDisplay } = codeStore;
const { isPeachEnabled } = storeToRefs(featureStore);
const { getProject } = storeToRefs(projectStore);

// State
const disableFormNavigationGuard: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<Partial<FormSchemaType> | undefined> = ref(undefined);
const isValidPeachPermit: Ref<boolean> = ref(false);
const noPeachDataModalVisible = defineModel<boolean>('visible');
const sourceSystemKinds: Ref<SourceSystemKind[]> = ref([]);
const updatedBy: Ref<User | undefined> = ref(undefined);

const isPeachIntegratedAuthType = computed(() =>
  checkIfPeachIntegratedAuthType(formRef.value?.values?.authorizationType?.sourceSystem)
);
const isPeachIntegratedTrackingId = computed(() =>
  checkIfPeachIntegratedTrackingId(formRef.value?.values?.permitTracking)
);
const isPeachIntegrated = computed(() => isPeachIntegratedAuthType.value && isPeachIntegratedTrackingId.value);

// Providers
const projectRouteName = inject(projectRouteNameKey);

// Actions
const sortForDisplayOrder = (a: SourceSystemKind, b: SourceSystemKind) => {
  const sourceA = codeDisplay.SourceSystem[a.sourceSystem];
  const sourceB = codeDisplay.SourceSystem[b.sourceSystem];
  if (sourceA && sourceB) {
    const srcSysCompare = sourceA.localeCompare(sourceB, locale.value, { sensitivity: 'base' });
    if (srcSysCompare !== 0) return srcSysCompare;
  }
  return a.description.localeCompare(b.description, locale.value, { sensitivity: 'base' });
};

function checkIfPeachIntegratedAuthType(sourceSystem: string): boolean {
  const sourceSystemKind = sourceSystemKinds.value.find((ssk) => ssk.integrated && ssk.sourceSystem === sourceSystem);
  return !!sourceSystemKind;
}

function checkIfPeachIntegratedTrackingId(permitTrackings: PermitTracking[]): boolean {
  if (!permitTrackings || permitTrackings.length === 0) return false;

  return permitTrackings.some((pt) => {
    const sourceSystemKind = sourceSystemKinds.value.find(
      (ssk) => ssk.integrated && ssk.sourceSystemKindId === pt.sourceSystemKindId
    );
    return !!sourceSystemKind;
  });
}

async function getPeachSummary(permitTrackings: PermitTracking[]) {
  try {
    const data: PermitTracking[] = permitTrackings.map((pt) => {
      const found =
        sourceSystemKinds.value.find((ssk) => ssk.sourceSystemKindId === pt.sourceSystemKindId) ||
        ({} as SourceSystemKind);
      return {
        ...pt,
        sourceSystemKind: omit(found, ['permitTypeIds']) as SourceSystemKind
      };
    });
    const peachSummary = await peachService.getPeachSummary(data);
    return peachSummary.data;
  } catch (e) {
    if (isAxiosError(e)) {
      const systemRecordNotFound =
        e.response?.data.extra?.peachError.record_id && e.response.data.extra?.peachError.system_id;

      if (e.status === 404 && systemRecordNotFound) {
        noPeachDataModalVisible.value = isPeachEnabled.value; // Change to `true` once toggle removed
      } else {
        toast.error(e.message);
      }
    } else {
      toast.error(String(e));
    }
  }
}

function handlePeachIntegrationChange(now: boolean, prev?: boolean) {
  if (!isPeachEnabled.value) return;
  if (!formRef.value?.values) return;

  const peachUpdateNotePlaceholder = t('authorization.authorizationForm.peachNoteUpdate');
  const currentNote = formRef.value.values.permitNote ?? '';

  const wasPeachIntegrated = !!prev;

  // Entering a PEACH-integrated state, add template to note
  if (now && !wasPeachIntegrated) {
    formRef.value?.setFieldValue('needed', PermitNeeded.YES);

    const hasExistingNotes = !!authorization?.permitNote?.length;
    if (!hasExistingNotes) {
      // If note is empty, just template
      if (!currentNote.trim()) {
        formRef.value.setFieldValue('permitNote', peachUpdateNotePlaceholder);
      } else if (!currentNote.includes(peachUpdateNotePlaceholder)) {
        // If note already has content, append template once
        const combined = `${currentNote.trim()}\n\n${peachUpdateNotePlaceholder}`;
        formRef.value.setFieldValue('permitNote', combined);
      }
    }
  }

  // Leaving a PEACH-integrated state, remove template from note
  if (!now && wasPeachIntegrated) {
    if (!currentNote) return;

    if (currentNote.includes(peachUpdateNotePlaceholder)) {
      const cleanedNote = currentNote
        .replaceAll(peachUpdateNotePlaceholder, '')
        .replace(/\n{2,}/g, '\n\n') // normalize excess newlines
        .trim();

      formRef.value.setFieldValue('permitNote', cleanedNote);
    }
  }
}

function initializeFormValues() {
  if (authorization) {
    initialFormValues.value = {
      authorizationType: authorization.permitType,
      decisionDate: combineDateTime(authorization.decisionDate, authorization.decisionTime),
      submittedDate: combineDateTime(authorization.submittedDate, authorization.submittedTime),
      permitTracking: authorization.permitTracking?.map((pt) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sourceSystemKind, ...tracking } = pt;
        return tracking;
      }),
      issuedPermitId: authorization.issuedPermitId,
      statusLastChanged: combineDateTime(authorization.statusLastChanged, authorization.statusLastChangedTime),
      statusLastVerified: combineDateTime(authorization.statusLastVerified, authorization.statusLastVerifiedTime),
      stage: authorization.stage,
      state: authorization.state,
      needed: authorization.needed as PermitNeeded,
      permitId: authorization?.permitId,
      createdAt: authorization.createdAt,
      createdBy: authorization.createdBy,
      updatedAt: authorization.updatedAt,
      updatedBy: authorization.updatedBy
    };
  } else {
    // Set default values
    initialFormValues.value = {
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION
    };
  }
}

function onDelete() {
  confirmDialog.require({
    message: t('authorization.authorizationForm.deleteAuthMessage'),
    header: t('authorization.authorizationForm.deleteAuth'),
    acceptLabel: t('authorization.authorizationForm.confirm'),
    acceptClass: 'p-button-danger',
    acceptIcon: 'pi pi-trash',
    rejectLabel: t('authorization.authorizationForm.cancel'),
    rejectIcon: 'pi pi-times',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        await permitService.deletePermit(authorization?.permitId as string);
        toast.success(t('authorization.authorizationForm.authDeleted'));
        if (!projectRouteName?.value) throw new Error('No route');
        router.push({
          name: projectRouteName?.value,
          params: { projectId: getProject.value?.projectId },
          query: {
            initialTab: AUTHORIZATION_TAB
          }
        });
      } catch (e) {
        if (isAxiosError(e) || e instanceof Error)
          toast.error(t('authorization.authorizationForm.authDeletionError'), e.message);
        else toast.error(t('authorization.authorizationForm.authDeletionError'), String(e));
      }
    }
  });
}

function onInvalidSubmit({ errors }: GenericObject) {
  scrollToFirstError(errors);
}

async function onSubmit(data: GenericObject) {
  disableFormNavigationGuard.value = true;
  const decision = splitDateTime(data.decisionDate);
  const submitted = splitDateTime(data.submittedDate);
  const statusLastChanged = splitDateTime(data.statusLastChanged);
  const statusLastVerified = splitDateTime(data.statusLastVerified);

  const { authorizationType, permitNote, ...rest } = data as FormSchemaType;
  const permitData: PermitArgs = {
    ...rest,
    activityId: getProject.value!.activityId,
    permitTypeId: authorizationType.permitTypeId,
    submittedDate: submitted.date,
    submittedTime: submitted.time,
    decisionDate: decision.date,
    decisionTime: decision.time,
    statusLastVerified: statusLastVerified.date,
    statusLastVerifiedTime: statusLastVerified.time,
    statusLastChanged: statusLastChanged.date,
    statusLastChangedTime: statusLastChanged.time
  };

  try {
    if (
      isPeachEnabled.value &&
      checkIfPeachIntegratedAuthType(authorizationType.sourceSystem) &&
      checkIfPeachIntegratedTrackingId(data.permitTracking)
    ) {
      const response = await getPeachSummary(permitData?.permitTracking ?? []);
      if (response) {
        isValidPeachPermit.value = true;
        permitData.decisionDate = response.decisionDate;
        permitData.state = response.state;
        permitData.stage = response.stage;
        permitData.statusLastChanged = response.statusLastChanged;
        permitData.submittedDate = response.submittedDate;
        // Set statusLastVerified to statusLastChanged if statusLastChanged is more recent
        permitData.statusLastVerified =
          !permitData.statusLastVerified || response.statusLastChanged > permitData.statusLastVerified
            ? response.statusLastChanged
            : permitData.statusLastVerified;
      } else return;
    }
    const permitSubmitData = setEmptyStringsToNull(permitData);

    await permitService.upsertPermit({
      ...permitSubmitData,
      permitNote: [{ note: permitNote }],
      permitType: {
        permitTypeId: authorizationType.permitTypeId,
        agency: authorizationType.agency,
        type: authorizationType.type,
        name: authorizationType.name,
        trackedInAts: authorizationType.trackedInAts ?? false,
        sourceSystem: authorizationType.sourceSystem
      }
    });

    toast.success(t('authorization.authorizationForm.permitSaved'));

    if (!projectRouteName?.value) throw new Error('No route');
    router.push({
      name: projectRouteName.value,
      params: { projectId: getProject.value?.projectId },
      query: {
        initialTab: '2'
      }
    });
  } catch (e) {
    if (e instanceof Error) toast.error(t('authorization.authorizationForm.permitSaveFailed'), e.message);
  }
}

onBeforeMount(async () => {
  initializeFormValues();
  const response: SourceSystemKind[] = (await sourceSystemKindService.getSourceSystemKinds()).data;
  sourceSystemKinds.value = response.sort(sortForDisplayOrder);
  if (authorization?.updatedBy) {
    updatedBy.value = (await userService.searchUsers({ userId: [authorization?.updatedBy] })).data[0];
  }
});

watch(() => isPeachIntegrated.value, handlePeachIntegrationChange, { immediate: true });
</script>

<template>
  <Form
    v-slot="{ setFieldValue, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!disableFormNavigationGuard" />
    <input
      type="hidden"
      name="permitId"
    />
    <h3 class="mt-4">
      {{ authorization?.permitType?.name ?? t('authorization.authorizationForm.addAuthorization') }}
    </h3>
    <AuthorizationCardIntake
      :editable="editable"
      :source-system-kinds="
        sourceSystemKinds.filter((ssk) => ssk.permitTypeIds.includes(values?.authorizationType?.permitTypeId))
      "
      class="mt-6"
      @update:uncheck-shown-to-proponent="
        (checkedIndex) => {
          values.permitTracking.forEach((item: any, i: number) => {
            if (i !== checkedIndex) {
              setFieldValue(`permitTracking.${i}.shownToProponent`, false);
            }
          });
        }
      "
    />
    <AuthorizationStatusUpdatesCard
      :editable="editable"
      :peach-integrated-auth-type="isPeachIntegratedAuthType && isPeachEnabled"
      :peach-integrated-tracking-id="isPeachIntegratedTrackingId && isPeachEnabled"
      class="mt-7"
      @update:set-verified-date="setFieldValue('statusLastVerified', new Date())"
    />
    <div class="mt-8 flex justify-between">
      <div>
        <Button
          class="mr-2"
          :label="
            isPeachIntegrated && isPeachEnabled
              ? t('authorization.authorizationForm.automatePublish')
              : t('authorization.authorizationForm.publish')
          "
          type="submit"
          icon="pi pi-check"
          :disabled="!editable"
        />
        <Button
          class="p-button-outlined mr-2"
          :label="t('authorization.authorizationForm.cancel')"
          icon="pi pi-times"
          @click="
            router.push({
              name: projectRouteName,
              params: { projectId: getProject?.projectId },
              query: {
                initialTab: AUTHORIZATION_TAB
              }
            })
          "
        />
      </div>
      <Button
        v-if="authorization?.permitId"
        class="p-button-outlined mr-2 p-button-danger"
        :label="t('authorization.authorizationForm.delete')"
        icon="pi pi-trash"
        :disabled="!editable"
        @click="onDelete"
      />
    </div>

    <div
      v-if="authorization?.permitId"
      class="grid grid-cols-4 gap-x-6 gap-y-6 authorization-details-block pl-6 py-3 mt-8"
    >
      <div class="flex">
        <span class="font-bold mr-2">
          {{ t('authorization.authorizationForm.agency') }}
        </span>
        {{ authorization?.permitType?.agency }}
      </div>
      <div class="flex justify-center">
        <span class="font-bold mr-2">{{ t('authorization.authorizationForm.businessDomain') }}</span>
        {{ authorization?.permitType?.businessDomain }}
      </div>
      <div class="flex justify-center">
        <span class="font-bold mr-2">{{ t('authorization.authorizationForm.updatedBy') }}</span>
        {{ updatedBy?.lastName }}, {{ updatedBy?.firstName }}
      </div>
      <div class="flex justify-center">
        <span class="font-bold mr-2">{{ t('authorization.authorizationForm.lastUpdated') }}</span>
        {{ formatDateTime(authorization?.updatedAt) }}
      </div>
    </div>
    <h4 class="my-10">{{ t('authorization.authorizationForm.updateHistory') }}</h4>
    <AuthorizationUpdateHistory
      v-if="authorization?.permitId"
      :editable="true"
      class="mt-6"
      :authorization-notes="authorization?.permitNote"
    />
  </Form>
  <Dialog
    v-model:visible="noPeachDataModalVisible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-max"
  >
    <template #header>
      <span class="p-dialog-title app-primary-color">{{ t('authorization.authorizationForm.noRecordsFound') }}</span>
    </template>
    <div>
      <div>{{ t('authorization.authorizationForm.noPeachDataMsgl1') }}</div>
      <ul class="list-disc px-6">
        <li>
          {{ t('authorization.authorizationForm.noPeachDataMsgl2') }}
        </li>
        <li>
          {{ t('authorization.authorizationForm.noPeachDataMsgl3') }}
        </li>
      </ul>
      <div class="flex justify-end mt-6">
        <Button
          class="p-button-solid mr-4"
          :label="t('authorization.authorizationForm.confirm')"
          @click="noPeachDataModalVisible = false"
        />
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
.authorization-details-block {
  background-color: var(--p-greyscale-50);
  border-radius: 0.5rem;
}
</style>
