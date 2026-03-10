<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, useSetFieldValue } from 'vee-validate';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { FormNavigationGuard } from '@/components/form';
import { CollectionDisclaimer, ContactCardIntakeForm, TextAreaCard } from '@/components/form/common';
import { Button, Card, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService } from '@/services';
import { useAppStore, useContactStore, useFormStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { ActivityContactRole, FormState } from '@/utils/enums/projectCommon';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey
} from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';
import { enquirySchema } from '@/validators/enquiry';

import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { Enquiry, Permit, Project } from '@/types';
import type { FormSchemaType } from '@/validators/enquiry';
import type { EnquiryArgs } from '@/types/Enquiry';

// Props
const {
  enquiryId = undefined,
  project = undefined,
  permit = undefined
} = defineProps<{
  enquiryId?: string;
  project?: Project;
  permit?: Permit;
}>();

// Injections
const enquiryConfirmRouteName = inject(enquiryConfirmRouteNameKey);
const enquiryPermitConfirmRouteName = inject(enquiryPermitConfirmRouteNameKey);
const enquiryProjectConfirmRouteName = inject(enquiryProjectConfirmRouteNameKey);
const enquiryRouteName = inject(enquiryRouteNameKey);

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();
const setEnquiryDescription = useSetFieldValue('basic.enquiryDescription');

// Store
const appStore = useAppStore();
const contactStore = useContactStore();
const formStore = useFormStore();
const { getInitiative } = storeToRefs(appStore);
const { getEditable } = storeToRefs(formStore);

// State
const initialFormValues: Ref<undefined | GenericObject> = ref(undefined);
const isOnlyProjectRelated: Ref<boolean> = computed(() => Boolean(project && !permit));
const isPermitRelated: Ref<boolean> = computed(() => Boolean(permit));
const trackingId: Ref<string> = computed(() => {
  return permit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId || t('enquiryIntakeForm.notApplicable');
});

// Actions
function confirmSubmit(data: GenericObject) {
  confirm.require({
    message: t('enquiryIntakeForm.submit.message'),
    header: t('enquiryIntakeForm.submit.header'),
    acceptLabel: t('ui.actions.confirm'),
    rejectLabel: t('ui.actions.cancel'),
    rejectProps: { outlined: true },
    accept: () => onSubmit(data as FormSchemaType)
  });
}

function getEnquiryConfirmationRoute(enquiry: Enquiry) {
  if (isOnlyProjectRelated.value) {
    return {
      name: enquiryProjectConfirmRouteName?.value,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  } else if (isPermitRelated.value) {
    return {
      name: enquiryPermitConfirmRouteName?.value,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  } else {
    return {
      name: enquiryConfirmRouteName?.value,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  }
}

function onInvalidSubmit() {
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSubmit(values: FormSchemaType) {
  formStore.setFormState(FormState.LOCKED);

  try {
    let payload: EnquiryArgs = {
      enquiryDescription: values.basic.enquiryDescription,
      relatedActivityId: project?.activityId ?? undefined,
      contact: values.contacts
    };

    if (permit) {
      const regarding = t('enquiryIntakeForm.regarding', { permitName: permit.permitType?.name });
      const trackId = t('enquiryIntakeForm.trackingId', { trackingId: trackingId.value });
      const authStatus = t('enquiryIntakeForm.authStatus', { authStatus: permit.state });
      const permitDesc = `${regarding}\n${trackId}\n${authStatus}\n`;
      payload.enquiryDescription = permitDesc + payload.enquiryDescription;
      setEnquiryDescription(payload.enquiryDescription);
    }

    // Create enquiry
    const response = await enquiryService.createEnquiry(payload);

    // Save contact data to store
    // TODO: Remove once user is forced to fill contact data out
    contactStore.setContact(response.data.contact);

    router.push(getEnquiryConfirmationRoute(response.data));
  } catch (e) {
    generalErrorHandler(e, t('enquiryIntakeForm.submit.saveFailed'), undefined, toast);
    formStore.setFormState(FormState.UNLOCKED);
  }
}

onBeforeMount(async () => {
  try {
    let primaryContact, response;

    if (enquiryId) {
      response = (await enquiryService.getEnquiry(enquiryId)).data;

      primaryContact = response
        ? response.activity?.activityContact?.find((x) => x.role === ActivityContactRole.PRIMARY)?.contact
        : useContactStore().getContact;
    } else {
      // Load contact data for new enquiry
      primaryContact = contactStore.getContact;
    }

    initialFormValues.value = {
      activityId: response?.activityId,
      enquiryId: response?.enquiryId,
      contacts: {
        firstName: primaryContact?.firstName,
        lastName: primaryContact?.lastName,
        phoneNumber: primaryContact?.phoneNumber,
        email: primaryContact?.email,
        contactApplicantRelationship: primaryContact?.contactApplicantRelationship,
        contactPreference: primaryContact?.contactPreference,
        contactId: primaryContact?.contactId
      },
      basic: {
        relatedActivityId: response?.relatedActivityId,
        enquiryDescription: response?.enquiryDescription
      }
    };
  } catch (e) {
    if (getInitiative.value !== Initiative.ELECTRIFICATION) router.replace({ name: enquiryRouteName?.value });
    else router.replace({ name: RouteName.EXT_ELECTRIFICATION });
    generalErrorHandler(e, t('enquiryIntakeForm.load.failed'));
  }
});
</script>

<template>
  <div>
    <CollectionDisclaimer />

    <Card>
      <template #title>
        <i18n-t
          v-if="isOnlyProjectRelated || isPermitRelated"
          keypath="enquiryIntakeForm.enquiryAbout"
          tag="div"
          class="flex flex-row mt-2 section-header"
          scope="global"
        >
          <template
            v-if="isOnlyProjectRelated"
            #projectDetails
          >
            <span class="ml-1 text-primary">
              {{
                t('enquiryIntakeForm.projectAboutDetails', {
                  projectName: project?.projectName,
                  activityId: project?.activityId
                })
              }}
            </span>
          </template>

          <template
            v-if="isPermitRelated"
            #permitDetails
          >
            <span class="ml-1 text-primary">
              {{
                t('enquiryIntakeForm.relatedPermitDetails', {
                  permitName: permit?.permitType?.name,
                  trackingId,
                  authStatus: permit?.state ?? 'No authorization status.'
                })
              }}
            </span>
          </template>
        </i18n-t>
        <p class="mt-2 text-primary">{{ t('enquiryIntakeForm.expectation') }}</p>
      </template>
    </Card>

    <Form
      v-if="initialFormValues"
      keep-values
      :initial-values="initialFormValues"
      :validation-schema="enquirySchema"
      @invalid-submit="onInvalidSubmit"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard v-if="getEditable" />

      <ContactCardIntakeForm :initial-form-values="initialFormValues.contacts" />
      <TextAreaCard
        :header="t('enquiryIntakeForm.headers.textArea')"
        field-name="basic.enquiryDescription"
        :placeholder="t('enquiryIntakeForm.placeholders.textArea')"
      />

      <div class="flex align-center justify-center mt-4">
        <Button
          :label="t('ui.actions.submit')"
          type="submit"
          icon="pi pi-upload"
          :disabled="!getEditable"
        />
      </div>
    </Form>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: var(--p-red-500) !important;
}
</style>
