<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { date, object, string } from 'yup';

import AuthorizationCardIntake from '@/components/form/common/AuthorizationCardIntake.vue';
import AuthorizationStatusUpdatesCard from '@/components/form/common/AuthorizationStatusUpdatesCard.vue';
import AuthorizationUpdateHistory from '@/components/common/AuthorizationUpdateHistory.vue';
import { Button, useToast } from '@/lib/primevue';
import { permitService, permitNoteService } from '@/services';
import { useConfigStore, useProjectStore } from '@/store';
import { PERMIT_AUTHORIZATION_STATUS_LIST, PERMIT_STATUS_LIST } from '@/utils/constants/permit';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';
import { formatDate } from '@/utils/formatters';
import { projectViewRouteNameKey, projectServiceKey } from '@/utils/keys';
import { permitNoteNotificationTemplate } from '@/utils/templates';

import type { Permit } from '@/types';

// Props
const { activityId, projectId } = defineProps<{
  activityId: string;
  projectId: string;
}>();

// Constants
const AUTHORIZATION_TAB = '2';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Store
const projectStore = useProjectStore();
const { getConfig } = storeToRefs(useConfigStore());

// Providers
const projectViewRouteName = inject(projectViewRouteNameKey);
const projectService = inject(projectServiceKey);

// Actions
const initialFormValues = {
  // ...other fields,
  permitTracking: [{ sourceSystemKindId: undefined, trackingId: '', shownToProponent: false }]
};

async function onSubmit(data: any) {
  const { authorizationType, permitNote, ...rest } = data;

  const permitData = {
    ...rest,
    permitTypeId: authorizationType?.permitTypeId,
    submittedDate: data.submittedDate?.toISOString(),
    adjudicationDate: data.adjudicationDate?.toISOString()
  } as Permit;

  try {
    const result = (await permitService.createPermit({ ...permitData, activityId: activityId })).data;
    projectStore.addPermit(result);

    await permitNoteService.createPermitNote({
      permitId: result.permitId,
      note: permitNote
    });

    // Send email to the user if permit is needed
    if (data.needed === PermitNeeded.YES || data.status !== PermitStatus.NEW) emailNotification(data);

    toast.success('Permit saved');

    router.push({
      name: projectViewRouteName,
      params: { projectId: projectId },
      query: {
        initialTab: '2'
      }
    });
  } catch (e: any) {
    toast.error('Failed to save permit', e.message);
  }
}
async function emailNotification(data?: any) {
  const configCC = getConfig.value.ches?.submission?.cc;
  const project = projectStore.getProject;
  const body = permitNoteNotificationTemplate({
    '{{ contactName }}': project?.contacts[0].firstName,
    '{{ activityId }}': project?.activityId,
    '{{ permitName }}': data.authorizationType.name,
    '{{ submittedDate }}': formatDate(data.submittedDate ?? data.createdAt),
    '{{ projectId }}': project?.projectId,
    '{{ permitId }}': data.permitId
  });
  let applicantEmail = project?.contacts[0].email as string;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: `Updates for project ${project?.activityId}, ${data.authorizationType.name}`,
    bodyType: 'html',
    body: body
  };

  if (!projectService) throw new Error('No service');
  await projectService.emailConfirmation(emailData);
}

const formSchema = object({
  permitNote: string().when('status', {
    is: (status: string) => status !== PermitStatus.NEW && status !== undefined,
    then: (schema) =>
      schema.required('The status of this application has changed. Please add an update for the proponent.'),
    otherwise: () => string().notRequired()
  }),
  authorizationType: object().required().label('Authorization type'),
  needed: string().required().label('Needed'),
  status: string().required().oneOf(PERMIT_STATUS_LIST).label('Application stage'),
  authStatus: string()
    .required()
    .oneOf(PERMIT_AUTHORIZATION_STATUS_LIST)
    .label('Authorization status')
    .test(
      'valid-auth-status',
      'Authorization status can only be "None" if the authorization state is "Pre-submission".',
      function (value) {
        const { status } = this.parent;
        return (
          (status === PermitStatus.NEW && value === PermitAuthorizationStatus.NONE) ||
          (status !== PermitStatus.NEW && value !== PermitAuthorizationStatus.NONE)
        );
      }
    )
    .test(
      'valid-auth-status',
      'Authorization status cannot be "In progress" if the authorization state is "Post-decision".',
      function (value) {
        const { status } = this.parent;
        return status !== PermitStatus.COMPLETED || value !== PermitAuthorizationStatus.IN_REVIEW;
      }
    ),
  submittedDate: date().max(new Date(), 'Submitted date cannot be in the future').nullable().label('Submitted date'),
  adjudicationDate: date()
    .max(new Date(), 'Adjudication date cannot be in the future')
    .nullable()
    .label('Adjudication date')
});
</script>

<template>
  <Form
    v-slot="{ setFieldValue, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
  >
    <h3 class="mt-4">{{ t('i.common.authorization.authorizationForm.addAuthorization') }}</h3>

    <AuthorizationCardIntake
      initial-form-values=""
      :editable="true"
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
    <input
      type="hidden"
      name="shownToProponentCount"
    />
    <AuthorizationStatusUpdatesCard
      initial-form-values=""
      :editable="true"
      class="mt-7"
      @update:set-verified-date="setFieldValue('statusLastVerified', new Date().toISOString())"
    />
    <div class="mt-8">
      <Button
        class="mr-2"
        :label="t('i.common.authorization.authorizationForm.publish')"
        type="submit"
        icon="pi pi-check"
      />
      <Button
        class="p-button-outlined mr-2"
        :label="t('i.common.authorization.authorizationForm.cancel')"
        icon="pi pi-times"
        @click="
          router.push({
            name: projectViewRouteName,
            params: { projectId: projectId },
            query: {
              initialTab: AUTHORIZATION_TAB
            }
          })
        "
      />
    </div>

    <div class="grid grid-cols-4 gap-x-6 gap-y-6 authorization-details-block px-2 py-3 mt-8">
      <div class="font-bold">{{ t('i.common.authorization.authorizationForm.agency') }}</div>
      <div class="font-bold">{{ t('i.common.authorization.authorizationForm.businessDomain') }}</div>
      <div class="font-bold">{{ t('i.common.authorization.authorizationForm.updatedBy') }}</div>
      <div class="font-bold">{{ t('i.common.authorization.authorizationForm.lastUpdated') }}</div>
    </div>
    <AuthorizationUpdateHistory
      initial-form-values=""
      :editable="true"
      class="mt-6"
    />
  </Form>
</template>

<style lang="scss" scoped>
h3 {
  font-weight: bold;
}
.authorization-details-block {
  background-color: $app-grey;
  border-radius: 0.5rem;
}
</style>
