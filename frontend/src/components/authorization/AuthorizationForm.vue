<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { array, boolean, number, object, string } from 'yup';

import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import AuthorizationStatusUpdatesCard from '@/components/authorization/AuthorizationStatusUpdatesCard.vue';
import AuthorizationUpdateHistory from '@/components/authorization/AuthorizationUpdateHistory.vue';
import { FormNavigationGuard } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { peachService, permitService, permitNoteService, sourceSystemKindService, userService } from '@/services';
import { useCodeStore, useConfigStore, useProjectStore } from '@/store';
import {
  PEACH_INTEGRATED_SYSTEMS,
  PERMIT_NEEDED_LIST,
  PERMIT_STAGE_LIST,
  PERMIT_STATE_LIST
} from '@/utils/constants/permit';
import { PeachIntegratedSystem, PermitNeeded, PermitStage, PermitState } from '@/utils/enums/permit';
import { formatDate, formatDateOnly, formatDateTime } from '@/utils/formatters';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';
import { peachPermitNoteNotificationTemplate, permitNoteNotificationTemplate } from '@/utils/templates';
import { combineDateTime, scrollToFirstError, setEmptyStringsToNull, splitDateTime } from '@/utils/utils';
import { notInFutureValidator } from '@/validators/common';

import type { Ref } from 'vue';
import type { Permit, PermitTracking, SourceSystemKind, User } from '@/types';

// Props
const { authorization, editable } = defineProps<{
  authorization?: Permit;
  editable?: boolean;
}>();

// Constants
const AUTHORIZATION_TAB = '2';
const PEACH_INTEGRATED_TRACKING = new Set([
  'Disposition Transaction ID',
  'Job Number',
  'Tracking Number',
  'Authorization ID'
]);

// Composables
const codeStore = useCodeStore();
const { locale, t } = useI18n();
const confirmDialog = useConfirm();
const projectStore = useProjectStore();
const router = useRouter();
const toast = useToast();

// Store
const { codeDisplay } = codeStore;
const { getConfig } = storeToRefs(useConfigStore());
const { getProject } = storeToRefs(projectStore);

// State
const disableFormNavigationGuard: Ref<boolean> = ref(false);
const expandPanel: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const isValidPeachPermit: Ref<boolean> = ref(false);
const noPeachDataModalVisible = defineModel<boolean>('visible');
const sourceSystemKinds: Ref<Array<SourceSystemKind>> = ref([]);
const updatedBy: Ref<User | undefined> = ref(undefined);

// Providers
const projectRouteName = inject(projectRouteNameKey);
const projectService = inject(projectServiceKey);

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

async function onSubmit(data: any) {
  disableFormNavigationGuard.value = true;
  const decision = splitDateTime(data.decisionDate);
  const submitted = splitDateTime(data.submittedDate);
  const statusLastChanged = splitDateTime(data.statusLastChanged);
  const statusLastVerified = splitDateTime(data.statusLastVerified);

  const { authorizationType, permitNote, ...rest } = data;
  const permitData: Permit = {
    ...rest,
    activityId: getProject.value?.activityId,
    permitTypeId: authorizationType?.permitTypeId,
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
    if (isPeachIntegratedAuthType(authorizationType.sourceSystem) && isPeachIntegratedTrackingId(data.permitTracking)) {
      const response = await getPeachSummary(permitData?.permitTracking);
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
    const result = (await permitService.upsertPermit({ ...permitSubmitData })).data;

    // Prevent creating notes and sending an update email if the above call fails or if note is empty
    if (result?.permitId && permitNote?.trim().length > 0) {
      await permitNoteService.createPermitNote({
        permitId: result.permitId,
        note: permitNote
      });

      // Send email to the user if permit is needed or if permit stage is not pre-submission
      if (data.needed === PermitNeeded.YES || data.stage !== PermitStage.PRE_SUBMISSION) emailNotification(result);
    }

    toast.success(t('authorization.authorizationForm.permitSaved'));

    if (!projectRouteName?.value) throw new Error('No route');
    router.push({
      name: projectRouteName.value,
      params: { projectId: getProject.value?.projectId },
      query: {
        initialTab: '2'
      }
    });
  } catch (e: any) {
    toast.error(t('authorization.authorizationForm.permitSaveFailed'), e.message);
  }
}

async function getPeachSummary(permitTrackings: PermitTracking[]) {
  try {
    const data: PermitTracking[] = permitTrackings.map((pt) => {
      const systemKind = sourceSystemKinds.value.find((ssk) => ssk.sourceSystemKindId === pt.sourceSystemKindId);
      return {
        sourceSystemKind: {
          sourceSystem: systemKind?.sourceSystem as string,
          description: systemKind?.description as string,
          sourceSystemKindId: systemKind?.sourceSystemKindId as number
        },
        trackingId: pt.trackingId
      };
    });
    const peachIntegratedResponse = await peachService.getPeachSummary(data);
    return peachIntegratedResponse.data;
  } catch (e: any) {
    const systemRecordNotFound =
      e.response.data.extra?.peachError.record_id && e.response.data.extra?.peachError.system_id;
    if (e.status === 404 && systemRecordNotFound) {
      noPeachDataModalVisible.value = true;
    } else {
      toast.error(e.message);
    }
  }
}

async function emailNotification(data: Permit) {
  const emailTemplateData = {
    '{{ contactName }}':
      getProject.value?.contacts?.[0]?.firstName ||
      getProject.value?.activity?.activityContact?.[0]?.contact?.firstName,
    '{{ activityId }}': getProject.value?.activityId,
    '{{ permitName }}': data.permitType.name,
    '{{ submittedDate }}': data.submittedDate ? formatDateOnly(data.submittedDate) : formatDate(data.createdAt),
    '{{ projectId }}': getProject.value?.projectId,
    '{{ permitId }}': data.permitId
  };
  const configCC = getConfig.value.ches?.submission?.cc;
  let body;
  if (isValidPeachPermit.value) body = peachPermitNoteNotificationTemplate(emailTemplateData);
  else body = permitNoteNotificationTemplate(emailTemplateData);

  let applicantEmail =
    (getProject.value?.contacts?.[0]?.email as string) ||
    (getProject.value?.activity?.activityContact?.[0]?.contact?.email as string);
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: `Updates for project ${getProject.value?.activityId}, ${data.permitType.name}`,
    bodyType: 'html',
    body: body
  };

  if (!projectService?.value) throw new Error('No service');
  await projectService.value.emailConfirmation(emailData);
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
      } catch (e: any) {
        toast.error(t('authorization.authorizationForm.authDeletionError'), e.message);
      }
    }
  });
}

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
  permitTracking: array().of(
    object({
      sourceSystemKindId: number().required().label(t('authorization.authorizationForm.trackingIdType')),
      trackingId: string().max(255).required().label(t('authorization.authorizationForm.trackingId')),
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

function initializeFormValues() {
  if (authorization) {
    initialFormValues.value = {
      authorizationType: authorization.permitType,
      decisionDate: combineDateTime(authorization.decisionDate, authorization.decisionTime),
      submittedDate: combineDateTime(authorization.submittedDate, authorization.submittedTime),
      permitTracking: authorization.permitTracking.map((pt) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sourceSystemKind, ...tracking } = pt;
        return tracking;
      }),
      issuedPermitId: authorization.issuedPermitId,
      statusLastChanged: combineDateTime(authorization.statusLastChanged, authorization.statusLastChangedTime),
      statusLastVerified: combineDateTime(authorization.statusLastVerified, authorization.statusLastVerifiedTime),
      stage: authorization.stage,
      state: authorization.state,
      needed: authorization.needed,
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

const isPeachIntegratedAuthType = (sourceSystem: PeachIntegratedSystem): boolean => {
  return PEACH_INTEGRATED_SYSTEMS.includes(sourceSystem);
};

const isPeachIntegratedTrackingId = (permitTrackings: PermitTracking[]): boolean => {
  if (!permitTrackings || permitTrackings.length === 0) return false;
  // If any of the selected tracking IDs are peach integrated, return true
  return permitTrackings.some((pt) => {
    const systemKind = sourceSystemKinds.value.find((ssk) => ssk.sourceSystemKindId === pt.sourceSystemKindId);
    const description = systemKind?.description as string;
    return PEACH_INTEGRATED_TRACKING.has(description);
  });
};

function onInvalidSubmit(e: any) {
  scrollToFirstError(e.errors);
}

onBeforeMount(async () => {
  initializeFormValues();
  const response = (await sourceSystemKindService.getSourceSystemKinds()).data;
  sourceSystemKinds.value = response.sort(sortForDisplayOrder);
  if (authorization?.updatedBy) {
    updatedBy.value = (await userService.searchUsers({ userId: [authorization?.updatedBy] })).data[0];
  }
});

watchEffect(() => {
  // Ensure that form values are loaded
  if (!formRef?.value?.values) return;
  // Set Needed to YES and add automated peach note if peach integrated auth type and tracking id are selected
  if (
    isPeachIntegratedAuthType(formRef.value?.values?.authorizationType?.sourceSystem) &&
    isPeachIntegratedTrackingId(formRef.value?.values?.permitTracking)
  ) {
    formRef.value?.setFieldValue('needed', PermitNeeded.YES);
    // Set automated peach note only if none exists
    if (!authorization?.permitNote || authorization?.permitNote.length == 0)
      formRef.value?.setFieldValue('permitNote', t('authorization.authorizationForm.peachNoteUpdate'));
  } else {
    // Clear permit note only if the form is dirty
    if (formRef.value.getMeta().dirty) formRef.value?.setFieldValue('permitNote', '');
  }
});
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
      {{ authorization ? authorization.permitType.name : t('authorization.authorizationForm.addAuthorization') }}
    </h3>

    <AuthorizationCardIntake
      :editable="editable"
      :source-system-kinds="sourceSystemKinds"
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
      :peach-integrated-auth-type="isPeachIntegratedAuthType(values?.authorizationType?.sourceSystem)"
      :peach-integrated-tracking-id="isPeachIntegratedTrackingId(values?.permitTracking)"
      class="mt-7"
      @update:set-verified-date="setFieldValue('statusLastVerified', new Date())"
    />
    <div class="mt-8 flex justify-between">
      <div>
        <Button
          class="mr-2"
          :label="
            isPeachIntegratedTrackingId(values?.permitTracking) &&
            isPeachIntegratedAuthType(values?.authorizationType?.sourceSystem)
              ? t('authorization.authorizationForm.automatePublish')
              : t('authorization.authorizationForm.publish')
          "
          type="submit"
          icon="pi pi-check"
          :disabled="!editable"
          @click="expandPanel = true"
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
        {{ authorization?.permitType.agency }}
      </div>
      <div class="flex justify-center">
        <span class="font-bold mr-2">{{ t('authorization.authorizationForm.businessDomain') }}</span>
        {{ authorization?.permitType.businessDomain }}
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
