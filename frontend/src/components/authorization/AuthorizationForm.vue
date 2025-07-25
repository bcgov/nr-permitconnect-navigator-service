<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { array, date, boolean, number, object, string } from 'yup';

import AuthorizationCardIntake from '@/components/authorization/AuthorizationCardIntake.vue';
import AuthorizationStatusUpdatesCard from '@/components/authorization/AuthorizationStatusUpdatesCard.vue';
import AuthorizationUpdateHistory from '@/components/authorization/AuthorizationUpdateHistory.vue';
import { FormNavigationGuard } from '@/components/form';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { permitService, permitNoteService, userService } from '@/services';
import { useConfigStore, useProjectStore } from '@/store';
import { PERMIT_AUTHORIZATION_STATUS_LIST, PERMIT_STATUS_LIST } from '@/utils/constants/permit';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';
import { permitNoteNotificationTemplate } from '@/utils/templates';
import { scrollToFirstError } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Permit, PermitNote, User } from '@/types';

// Props
const { activityId, projectId, authorizationId } = defineProps<{
  activityId: string;
  projectId: string;
  authorizationId?: string;
}>();

// Constants
const AUTHORIZATION_TAB = '2';

// Composables
const { t } = useI18n();
const confirmDialog = useConfirm();
const router = useRouter();
const projectStore = useProjectStore();
const toast = useToast();

// Store
const { getConfig } = storeToRefs(useConfigStore());
const { getProject, getPermits } = storeToRefs(projectStore);

// State
const authorization: Ref<Permit | undefined> = ref(undefined);
const authorizationNotes: Ref<Array<PermitNote>> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const expandPanel: Ref<boolean> = ref(false);
const updatedBy: Ref<User | undefined> = ref(undefined);
const disableFormNavigationGuard: Ref<boolean> = ref(false);

// Providers
const projectRouteName = inject(projectRouteNameKey);
const projectService = inject(projectServiceKey);

// Actions

async function onSubmit(data: any) {
  disableFormNavigationGuard.value = true;

  const { authorizationType, permitNote, permitTracking, ...rest } = data;
  const permitData = {
    ...rest,
    permitTypeId: authorizationType?.permitTypeId,
    permitTracking: permitTracking,
    submittedDate: data.submittedDate?.toISOString(),
    adjudicationDate: data.adjudicationDate?.toISOString()
  } as Permit;

  try {
    const result = (await permitService.upsertPermit({ ...permitData, activityId: activityId })).data;
    projectStore.addPermit(result);

    // Prevent creating notes if the above call fails or if the note is empty
    if (result?.permitId && permitNote?.trim().length > 0)
      await permitNoteService.createPermitNote({
        permitId: result.permitId,
        note: permitNote
      });

    // Send email to the user if permit is needed
    if (data.needed === PermitNeeded.YES || data.status !== PermitStatus.NEW) emailNotification(data);

    toast.success(t('authorization.authorizationForm.permitSaved'));

    router.push({
      name: projectRouteName,
      params: { projectId },
      query: {
        initialTab: '2'
      }
    });
  } catch (e: any) {
    toast.error(t('authorization.authorizationForm.permitSaveFailed'), e.message);
  }
}
async function emailNotification(data?: any) {
  const configCC = getConfig.value.ches?.submission?.cc;
  const body = permitNoteNotificationTemplate({
    '{{ contactName }}':
      getProject.value?.contacts?.[0]?.firstName || getProject.value?.activity?.activityContact?.[0].contact?.firstName,
    '{{ activityId }}': getProject.value?.activityId,
    '{{ permitName }}': data.authorizationType.name,
    '{{ submittedDate }}': formatDate(data.submittedDate?.toISOString() ?? data.createdAt?.toISOString()),
    '{{ projectId }}': getProject.value?.projectId,
    '{{ permitId }}': data.permitId
  });
  let applicantEmail =
    (getProject.value?.contacts?.[0].email as string) ||
    (getProject.value?.activity?.activityContact?.[0].contact?.email as string);
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: `Updates for project ${getProject.value?.activityId}, ${data.authorizationType.name}`,
    bodyType: 'html',
    body: body
  };

  if (!projectService) throw new Error('No service');
  await projectService.emailConfirmation(emailData);
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
        await permitService.deletePermit(authorizationId as string);
        toast.success(t('authorization.authorizationForm.authDeleted'));
        router.push({
          name: projectRouteName,
          params: { projectId },
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
  permitNote: string().when('status', {
    is: (status: string) => status !== initialFormValues.value?.status,
    then: (schema) => schema.required(t('authorization.authorizationForm.noteRequired')),
    otherwise: () => string().notRequired()
  }),
  authorizationType: object().required().label(t('authorization.authorizationForm.authorizationType')),
  needed: string().required().label(t('authorization.authorizationForm.needed')),
  status: string().required().oneOf(PERMIT_STATUS_LIST).label(t('authorization.authorizationForm.applicationStage')),
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
  authStatus: string()
    .required()
    .oneOf(PERMIT_AUTHORIZATION_STATUS_LIST)
    .label(t('authorization.authorizationForm.authorizationStatus'))
    .test('valid-auth-status', t('authorization.authorizationForm.authStatusConditionNewNone'), function (value) {
      const { status } = this.parent;
      return (
        (status === PermitStatus.NEW && value === PermitAuthorizationStatus.NONE) ||
        (status !== PermitStatus.NEW && value !== PermitAuthorizationStatus.NONE)
      );
    })
    .test('valid-auth-status', t('authorization.authorizationForm.authStatusConditionInProPre'), function (value) {
      const { status } = this.parent;
      return status !== PermitStatus.COMPLETED || value !== PermitAuthorizationStatus.IN_REVIEW;
    }),
  submittedDate: date()
    .max(new Date(), t('authorization.authorizationForm.submittedDateFutureError'))
    .nullable()
    .label(t('authorization.authorizationForm.submittedDate')),
  adjudicationDate: date()
    .max(new Date(), t('authorization.authorizationForm.adjudicationDateFutureError'))
    .nullable()
    .label(t('authorization.authorizationForm.adjudicationDate'))
});

function initializeFormValues() {
  if (authorizationId) {
    authorization.value = getPermits.value.find((p) => p.permitId === authorizationId) as Permit;
    authorizationNotes.value = authorization.value.permitNote;
    if (authorization.value) {
      initialFormValues.value = {
        authorizationType: authorization.value.permitType,
        adjudicationDate: authorization.value.adjudicationDate ? new Date(authorization.value.adjudicationDate) : null,
        submittedDate: authorization.value.submittedDate ? new Date(authorization.value.submittedDate) : null,
        permitTracking: authorization.value.permitTracking.map((tracking) => ({
          permitTrackingId: tracking.permitTrackingId,
          sourceSystemKindId: tracking.sourceSystemKind?.sourceSystemKindId,
          trackingId: tracking.trackingId,
          shownToProponent: tracking.shownToProponent
        })),
        issuedPermitId: authorization.value.issuedPermitId,
        statusLastVerified: authorization.value.statusLastVerified
          ? new Date(authorization.value.statusLastVerified)
          : null,
        authStatus: authorization.value.authStatus,
        status: authorization.value.status,
        needed: authorization.value.needed,
        permitId: authorization.value?.permitId
      };
    }
  } else {
    // Set default values
    initialFormValues.value = {
      authStatus: PermitAuthorizationStatus.NONE,
      status: PermitStatus.NEW
    };
  }
}

function onInvalidSubmit(e: any) {
  scrollToFirstError(e.errors);
}

onBeforeMount(async () => {
  initializeFormValues();
  if (authorization.value?.updatedBy) {
    updatedBy.value = (await userService.searchUsers({ userId: [authorization.value?.updatedBy] })).data[0];
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
      initial-form-values=""
      :editable="true"
      :expand-panel="authorizationId && !expandPanel ? true : false"
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
      initial-form-values=""
      :editable="true"
      class="mt-7"
      @update:set-verified-date="setFieldValue('statusLastVerified', new Date().toISOString())"
    />
    <div class="mt-8 flex justify-between">
      <div>
        <Button
          class="mr-2"
          :label="t('authorization.authorizationForm.publish')"
          type="submit"
          icon="pi pi-check"
          @click="expandPanel = true"
        />
        <Button
          class="p-button-outlined mr-2"
          :label="t('authorization.authorizationForm.cancel')"
          icon="pi pi-times"
          @click="
            router.push({
              name: projectRouteName,
              params: { projectId },
              query: {
                initialTab: AUTHORIZATION_TAB
              }
            })
          "
        />
      </div>
      <Button
        v-if="authorizationId"
        class="p-button-outlined mr-2 p-button-danger"
        :label="t('authorization.authorizationForm.delete')"
        icon="pi pi-trash"
        @click="onDelete"
      />
    </div>

    <div
      v-if="authorizationId"
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
    <AuthorizationUpdateHistory
      v-if="authorizationId"
      initial-form-values=""
      :editable="true"
      class="mt-6"
      :authorization-notes="authorizationNotes"
    />
  </Form>
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
