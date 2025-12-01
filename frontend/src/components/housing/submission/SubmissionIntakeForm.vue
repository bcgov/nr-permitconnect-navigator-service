<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, FieldArray, ErrorMessage } from 'vee-validate';
import { computed, onBeforeMount, nextTick, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Tooltip from '@/components/common/Tooltip.vue';
import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import Divider from '@/components/common/Divider.vue';
import {
  AutoComplete,
  DatePicker,
  Checkbox,
  FormAutosave,
  FormNavigationGuard,
  InputText,
  RadioList,
  Select,
  StepperHeader,
  StepperNavigation,
  TextArea
} from '@/components/form';
import {
  ContactCardIntakeForm,
  NaturalDisasterCard,
  LocationCard,
  CollectionDisclaimer
} from '@/components/form/common';
import SubmissionAssistance from '@/components/housing/submission/SubmissionAssistance.vue';
import { createProjectIntakeSchema } from '@/components/housing/submission/SubmissionIntakeSchema';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Button,
  Card,
  Message,
  Step,
  StepList,
  Stepper,
  StepPanel,
  StepPanels,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { documentService, enquiryService, externalApiService, housingProjectService, permitService } from '@/services';
import { useAppStore, useConfigStore, useContactStore, useProjectStore, usePermitStore } from '@/store';
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST, PROJECT_APPLICANT_LIST } from '@/utils/constants/housing';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/housing';
import { PermitNeeded, PermitStatus } from '@/utils/enums/permit';
import { IntakeFormCategory, SubmissionType } from '@/utils/enums/projectCommon';
import { confirmationTemplateEnquiry, confirmationTemplateHousingSubmission } from '@/utils/templates';
import { getHTMLElement, omit, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { Document, HousingProjectIntake, Permit, PermitType } from '@/types';

// Types
type HousingProjectForm = {
  addressSearch?: string;
} & HousingProjectIntake;

// Props
const { housingProjectId = undefined, draftId = undefined } = defineProps<{
  housingProjectId?: string;
  draftId?: string;
}>();

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

// Constants
const VALIDATION_BANNER_TEXT = t('submissionIntakeForm.validationBanner');

// Store
const contactStore = useContactStore();
const projectStore = useProjectStore();
const permitStore = usePermitStore();
const { getConfig } = storeToRefs(useConfigStore());
const { getPermitTypes } = storeToRefs(permitStore);

// State
const activeStep: Ref<number> = ref(0);
const activityId: Ref<string | undefined> = ref(undefined);
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const isSubmittable: Ref<boolean> = ref(false);
const locationRef: Ref<InstanceType<typeof LocationCard> | null> = ref(null);
const orgBookOptions: Ref<Array<any>> = ref([]);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);
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
  const submitData: HousingProjectIntake = omit(data as HousingProjectForm, ['addressSearch']);

  confirm.require({
    message: 'Are you sure you wish to submit this form?',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => onSubmit(submitData)
  });
}

async function emailConfirmation(actId: string, projectId: string, forProjectSubmission: boolean) {
  try {
    const configCC = getConfig.value.ches?.submission?.cc;
    const applicantName = formRef.value?.values.contacts.contactFirstName;
    const applicantEmail = formRef.value?.values.contacts.contactEmail;
    const initiative = toTitleCase(useAppStore().getInitiative);
    const subject = `Confirmation of ${forProjectSubmission ? 'Project' : 'Enquiry'} Submission`;
    let body: string;

    if (forProjectSubmission) {
      body = confirmationTemplateHousingSubmission({
        '{{ contactName }}': applicantName,
        '{{ initiative }}': initiative,
        '{{ activityId }}': actId,
        '{{ projectId }}': projectId
      });
    } else {
      body = confirmationTemplateEnquiry({
        '{{ contactName }}': applicantName,
        '{{ activityId }}': actId,
        '{{ enquiryDescription }}': t('submissionIntakeForm.assistanceMessage'),
        '{{ enquiryId }}': projectId
      });
    }
    const emailData = {
      from: configCC,
      to: [applicantEmail],
      cc: configCC,
      subject: subject,
      bodyType: 'html',
      body: body
    };
    await housingProjectService.emailConfirmation(emailData);
  } catch (e: any) {
    toast.error('Failed to send confirmation email. ', e);
  }
}

async function onAssistanceRequest(values: GenericObject) {
  try {
    const enquiryData = {
      basic: {
        enquiryDescription: t('submissionIntakeForm.assistanceMessage'),
        submissionType: SubmissionType.ASSISTANCE
      },
      contacts: [
        setEmptyStringsToNull({
          contactId: values.contacts.contactId,
          firstName: values.contacts.contactFirstName,
          lastName: values.contacts.contactLastName,
          phoneNumber: values.contacts.contactPhoneNumber,
          email: values.contacts.contactEmail,
          contactApplicantRelationship: values.contacts.contactApplicantRelationship,
          contactPreference: values.contacts.contactPreference
        })
      ]
    };

    const enquiryResponse = (await enquiryService.createEnquiry(enquiryData)).data;

    if (enquiryResponse.activityId) {
      toast.success('Form saved');

      // Send confirmation email
      emailConfirmation(enquiryResponse.activityId, enquiryResponse.housingProjectId, false);

      router.push({
        name: RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION,
        params: {
          enquiryId: enquiryResponse.enquiryId
        }
      });
    } else {
      toast.error('Failed to submit enquiry');
    }
  } catch (e: any) {
    toast.error('Failed to save enquiry', e);
  } finally {
    editable.value = true;
  }
}

async function onInvalidSubmit() {
  switch (validationErrors.value[0]) {
    case IntakeFormCategory.CONTACTS:
    case IntakeFormCategory.BASIC:
      activeStep.value = 0;
      break;

    case IntakeFormCategory.HOUSING:
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

// Callback function for FormNavigationGuard
// Cannot be directly added to the vue router lifecycle or things get out of sync
async function onBeforeRouteLeaveCallback() {
  // draftId and activityId are not stored in the draft json until first save
  // If they do not exist we can safely delete on leave as it means the user hasn't done anything
  if (draftId && editable.value) {
    const response = (await housingProjectService.getDraft(draftId)).data;
    if (response && !response.data.draftId && !response.data.activityId) {
      await housingProjectService.deleteDraft(draftId);
    }
  }
}

function onPermitsHasAppliedChange(e: string, fieldsLength: number, push: Function, setFieldValue: Function) {
  if (e === BasicResponse.YES || e === BasicResponse.UNSURE) {
    if (fieldsLength === 0) {
      push({
        permitTypeId: undefined,
        trackingId: undefined,
        status: undefined
      });
    }
  } else {
    setFieldValue('appliedPermits', undefined);
  }
}

async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((x: { [key: string]: string }) => x.type === 'name')
      .map((x: { [key: string]: string }) => x?.value);
  }
}

async function onSaveDraft(data: GenericObject, isAutoSave: boolean = false, showToast: boolean = true) {
  try {
    autoSaveRef.value?.stopAutoSave();

    const draftData = omit(data, ['addressSearch']);

    await housingProjectService.updateDraft({
      draftId: draftId,
      activityId: draftData.activityId,
      data: draftData
    });

    if (showToast) toast.success(isAutoSave ? 'Draft autosaved' : 'Draft saved');
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  }
}

async function onSubmit(data: any) {
  // If there is a change to contact fields,
  // please update onAssistanceRequest() as well.
  editable.value = false;

  try {
    autoSaveRef.value?.stopAutoSave();

    // Grab the contact information
    const contact = {
      contactId: data.contacts.contactId,
      firstName: data.contacts.contactFirstName,
      lastName: data.contacts.contactLastName,
      phoneNumber: data.contacts.contactPhoneNumber,
      email: data.contacts.contactEmail,
      contactApplicantRelationship: data.contacts.contactApplicantRelationship,
      contactPreference: data.contacts.contactPreference
    };

    // Omit all the fields we dont want to send
    const dataOmitted = omit(setEmptyStringsToNull({ ...data, contact }), ['contacts']);

    // Show the trackingNumber of all appliedPermits to the proponent
    dataOmitted.appliedPermits?.forEach((x: Permit) => {
      if (x.permitTracking) x.permitTracking = x.permitTracking.filter((pt) => pt.trackingId);
      if (x.permitTracking[0]) x.permitTracking[0].shownToProponent = true;
    });

    // Remove empty investigate permit objects
    const filteredInvestigatePermits = dataOmitted.investigatePermits?.filter(
      (x: object) => JSON.stringify(x) !== '{}'
    );

    dataOmitted.investigatePermits = filteredInvestigatePermits;

    const response = await housingProjectService.submitDraft({ ...dataOmitted, draftId });

    if (response.data.activityId && response.data.housingProjectId) {
      assignedActivityId.value = response.data.activityId;

      // Send confirmation email
      emailConfirmation(response.data.activityId, response.data.housingProjectId, true);

      // Save contact data to store
      contactStore.setContact(response.data.contact);

      router.push({
        name: RouteName.EXT_HOUSING_INTAKE_CONFIRMATION,
        params: {
          projectId: response.data.housingProjectId
        }
      });
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
    editable.value = true;
  }
}

onBeforeMount(async () => {
  try {
    // Clearing the document store on page load
    projectStore.setDocuments([]);

    let response,
      permits: Array<Permit> = [],
      documents: Array<Document> = [];

    if (draftId) {
      response = (await housingProjectService.getDraft(draftId)).data;

      initialFormValues.value = {
        ...response.data,
        draftId: response.draftId,
        activityId: response.activityId,
        appliedPermits:
          response.data.appliedPermits?.map((x: Partial<Permit>) => ({
            ...x,
            submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
          })) ?? []
      };

      // Load org book options if company name is already filled
      if (response.companyNameRegistered) {
        orgBookOptions.value = [response.companyNameRegistered];
      }

      if (response.activityId) {
        activityId.value = response.activityId;
        documents = (await documentService.listDocuments(response.activityId)).data;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        projectStore.setDocuments(documents);
      }
    } else {
      let firstContact;
      if (housingProjectId) {
        response = (await housingProjectService.getProject(housingProjectId)).data;
        projectStore.setProject(response);

        firstContact = response?.activity?.activityContact[0]?.contact;

        if (response.activityId) {
          activityId.value = response.activityId;
          permits = (await permitService.listPermits({ activityId: response.activityId })).data;
          documents = (await documentService.listDocuments(response.activityId)).data;
        }

        // Set form to read-only on non draft form reopening
        editable.value = false;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        projectStore.setDocuments(documents);
      } else {
        // Load contact data for new submission
        firstContact = contactStore.getContact;
      }

      initialFormValues.value = {
        activityId: response?.activityId,
        housingProjectId: response?.housingProjectId,
        contacts: {
          contactFirstName: firstContact?.firstName,
          contactLastName: firstContact?.lastName,
          contactPhoneNumber: firstContact?.phoneNumber,
          contactEmail: firstContact?.email,
          contactApplicantRelationship: firstContact?.contactApplicantRelationship,
          contactPreference: firstContact?.contactPreference,
          contactId: firstContact?.contactId
        },
        basic: {
          consentToFeedback: response?.consentToFeedback,
          projectApplicantType: response?.projectApplicantType,
          isDevelopedInBc: response?.isDevelopedInBc,
          registeredName: response?.companyNameRegistered
        },
        housing: {
          projectName: response?.projectName,
          projectDescription: response?.projectDescription,
          singleFamilySelected: !!response?.singleFamilyUnits,
          multiFamilySelected: !!response?.multiFamilyUnits,
          singleFamilyUnits: response?.singleFamilyUnits,
          multiFamilyUnits: response?.multiFamilyUnits,
          otherSelected: !!response?.otherUnits,
          otherUnitsDescription: response?.otherUnitsDescription,
          otherUnits: response?.otherUnits,
          hasRentalUnits: response?.hasRentalUnits,
          rentalUnits: response?.rentalUnits,
          financiallySupportedBc: response?.financiallySupportedBc,
          financiallySupportedIndigenous: response?.financiallySupportedIndigenous,
          indigenousDescription: response?.indigenousDescription,
          financiallySupportedNonProfit: response?.financiallySupportedNonProfit,
          nonProfitDescription: response?.nonProfitDescription,
          financiallySupportedHousingCoop: response?.financiallySupportedHousingCoop,
          housingCoopDescription: response?.housingCoopDescription
        },
        location: {
          naturalDisaster: response?.naturalDisaster,
          projectLocation: response?.projectLocation,
          streetAddress: response?.streetAddress,
          locality: response?.locality,
          province: response?.province,
          latitude: response?.latitude,
          longitude: response?.longitude,
          ltsaPidLookup: response?.locationPids,
          geomarkUrl: response?.geomarkUrl,
          projectLocationDescription: response?.projectLocationDescription,
          geoJson: response?.geoJson
        },
        appliedPermits: permits
          .filter((x: Permit) => x.status === PermitStatus.APPLIED)
          .map((x: Permit) => ({
            ...x,
            submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
          })),
        permits: {
          hasAppliedProvincialPermits: response?.hasAppliedProvincialPermits
        },
        investigatePermits: permits.filter((x: Permit) => x.needed === PermitNeeded.UNDER_INVESTIGATION)
      };
    }

    locationRef.value?.onLatLongInput();
  } catch (e: any) {
    toast.error('Failed to load intake', e);
    router.replace({ name: RouteName.EXT_HOUSING });
  }
});

watchEffect(() => {
  // Map component misaligned if mounted while not visible. Trigger resize to fix on show
  if (activeStep.value === 2) nextTick().then(() => locationRef?.value?.resizeMap());
  if (activeStep.value === 3) isSubmittable.value = true;
});
</script>

<template>
  <div>
    <div class="flex justify-center">
      <h2
        role="heading"
        aria-level="1"
      >
        Housing Project Intake Form
      </h2>
    </div>
    <Form
      v-if="initialFormValues"
      id="form"
      v-slot="{ setFieldValue, errors, meta, values }"
      ref="formRef"
      :initial-values="initialFormValues"
      :validation-schema="validationSchema"
      @invalid-submit="onInvalidSubmit"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard
        v-if="editable"
        :auto-save-ref="autoSaveRef"
        :callback="onBeforeRouteLeaveCallback"
      />
      <FormAutosave
        v-if="editable"
        ref="autoSaveRef"
        :callback="() => onSaveDraft(values, true)"
      />

      <SubmissionAssistance
        v-if="editable && values?.contacts"
        :form-values="values"
        @on-submit-assistance="onAssistanceRequest(values)"
      />

      <input
        type="hidden"
        name="draftId"
      />

      <input
        type="hidden"
        name="activityId"
      />

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
              title="Housing"
              icon="fa-house"
              :errors="validationErrors.includes(IntakeFormCategory.HOUSING)"
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

        <!-- Basic info -->
        <StepPanels>
          <StepPanel :value="0">
            <CollectionDisclaimer />

            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <ContactCardIntakeForm
              :editable="editable"
              :initial-form-values="initialFormValues"
            />

            <Card>
              <template #title>
                <span
                  class="section-header"
                  role="heading"
                  aria-level="2"
                >
                  {{ t('submissionIntakeForm.projectApplicantTypeCard') }}
                </span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <RadioList
                    class="col-span-12"
                    name="basic.projectApplicantType"
                    :bold="false"
                    :disabled="!editable"
                    :options="PROJECT_APPLICANT_LIST"
                    @on-change="
                      (e: string) => {
                        if (e === ProjectApplicant.BUSINESS) setFieldValue('basic.isDevelopedInBc', null);
                      }
                    "
                  />

                  <span
                    v-if="values.basic?.projectApplicantType === ProjectApplicant.BUSINESS"
                    class="col-span-12"
                  >
                    <div class="flex items-center">
                      <p class="font-bold">Is it registered in B.C?</p>
                      <Tooltip
                        class="pl-2"
                        right
                        icon="fa-solid fa-circle-question"
                        :text="t('submissionIntakeForm.isRegisteredTooltip')"
                      />
                    </div>
                    <RadioList
                      class="col-span-12 mt-2 pl-0"
                      name="basic.isDevelopedInBc"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_LIST"
                      @on-change="
                        () => setFieldValue('basic.registeredName', contactStore.getContact?.bceidBusinessName)
                      "
                    />
                    <AutoComplete
                      v-if="values.basic.isDevelopedInBc === BasicResponse.YES"
                      class="col-span-6 mt-4 pl-0"
                      name="basic.registeredName"
                      :bold="false"
                      :disabled="!editable"
                      :editable="true"
                      :placeholder="'Type to search the B.C registered name'"
                      :suggestions="orgBookOptions"
                      @on-complete="onRegisteredNameInput"
                    />
                    <InputText
                      v-else-if="values.basic.isDevelopedInBc === BasicResponse.NO"
                      class="col-span-6 mt-4 pl-0"
                      name="basic.registeredName"
                      :placeholder="'Type the business/company/organization name'"
                      :bold="false"
                      :disabled="!editable"
                    />
                  </span>
                </div>
              </template>
            </Card>
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

          <!-- Housing -->
          <StepPanel :value="1">
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <span
                  class="section-header"
                  role="heading"
                  aria-level="2"
                >
                  {{ t('submissionIntakeForm.projectNameCard') }}
                </span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <InputText
                    class="col-span-6"
                    name="housing.projectName"
                    label="Project name - your preferred name for your project"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <div class="col-span-6" />
                </div>
              </template>
            </Card>

            <Card>
              <template #title>
                <span
                  class="section-header"
                  role="heading"
                  aria-level="2"
                >
                  {{ t('submissionIntakeForm.singleFamilySelectedCard') }}
                </span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <Checkbox
                      name="housing.singleFamilySelected"
                      label="Single-family"
                      :bold="false"
                      :disabled="!editable"
                      :invalid="!!errors.housing && meta.touched"
                    />
                  </div>
                  <Select
                    v-if="values.housing.singleFamilySelected"
                    class="col-span-6"
                    name="housing.singleFamilyUnits"
                    :disabled="!editable || !values.housing.singleFamilySelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <div class="col-span-12">
                    <div class="flex">
                      <Checkbox
                        class="content-center"
                        name="housing.multiFamilySelected"
                        label="Multi-family"
                        :bold="false"
                        :disabled="!editable"
                        :invalid="!!errors.housing && meta.touched"
                      />
                      <Tooltip
                        class="pl-2"
                        right
                        icon="fa-solid fa-circle-question"
                        :text="t('submissionIntakeForm.multiFamilyTooltip')"
                      />
                    </div>
                  </div>
                  <Select
                    v-if="values.housing.multiFamilySelected"
                    class="col-span-6 content-center"
                    name="housing.multiFamilyUnits"
                    :disabled="!editable || !values.housing.multiFamilySelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <div class="col-span-12">
                    <Checkbox
                      name="housing.otherSelected"
                      label="Other"
                      :bold="false"
                      :disabled="!editable"
                      :invalid="!!errors?.housing && meta.touched"
                    />
                  </div>
                  <InputText
                    v-if="values.housing.otherSelected"
                    class="col-span-6"
                    name="housing.otherUnitsDescription"
                    :disabled="!editable || !values.housing.otherSelected"
                    placeholder="Type to describe what other type of housing"
                  />
                  <div class="col-span-6" />
                  <Select
                    v-if="values.housing.otherSelected"
                    class="col-span-6"
                    name="housing.otherUnits"
                    :disabled="!editable || !values.housing.otherSelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <ErrorMessage
                    v-if="meta.touched"
                    class="col-span-12"
                    name="housing"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex">
                  <span
                    class="section-header"
                    role="heading"
                    aria-level="2"
                  >
                    {{ t('submissionIntakeForm.hasRentalUnitsCard') }}
                  </span>
                  <Tooltip
                    right
                    icon="fa-solid fa-circle-question"
                    :text="t('submissionIntakeForm.rentalUnitsTooltip')"
                  />
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <RadioList
                    class="col-span-12"
                    name="housing.hasRentalUnits"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <Select
                    v-if="values.housing.hasRentalUnits === BasicResponse.YES"
                    class="col-span-6"
                    name="housing.rentalUnits"
                    :disabled="!editable"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex items-center justify-between">
                  <div class="flex flex-grow-1">
                    <span
                      class="section-header"
                      role="heading"
                      aria-level="2"
                    >
                      {{ t('submissionIntakeForm.financiallySupportedCard') }}
                    </span>
                  </div>
                  <Button
                    class="p-button-sm mr-4 p-button-danger"
                    outlined
                    :disabled="!editable"
                    @click="
                      () => {
                        setFieldValue('housing.financiallySupportedBc', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedIndigenous', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedNonProfit', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedHousingCoop', BasicResponse.NO);
                      }
                    "
                  >
                    No to all
                  </Button>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div>
                  <div class="mb-6">
                    <div class="flex items-center">
                      <label>
                        <a
                          href="https://www.bchousing.org/projects-partners/partner-with-us"
                          target="_blank"
                        >
                          BC Housing
                        </a>
                      </label>
                      <Tooltip
                        class="pl-2 mb-2"
                        right
                        icon="fa-solid fa-circle-question"
                        :text="t('submissionIntakeForm.bcHousingTooltip')"
                      />
                    </div>

                    <RadioList
                      name="housing.financiallySupportedBc"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_UNSURE_LIST"
                    />
                  </div>

                  <div class="mb-6">
                    <label>
                      <a
                        href="https://www.bchousing.org/housing-assistance/rental-housing/indigenous-housing-providers"
                        target="_blank"
                      >
                        Indigenous Housing Provider
                      </a>
                    </label>
                    <RadioList
                      name="housing.financiallySupportedIndigenous"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_UNSURE_LIST"
                    />
                    <InputText
                      v-if="values.housing?.financiallySupportedIndigenous === BasicResponse.YES"
                      class="w-1/2 pl-0"
                      name="housing.indigenousDescription"
                      :disabled="!editable"
                      placeholder="Name of Indigenous Housing Provider"
                    />
                  </div>

                  <div class="mb-6">
                    <label>
                      <a
                        href="https://bcnpha.ca/member-programs-list/"
                        target="_blank"
                      >
                        Non-profit housing society
                      </a>
                    </label>
                    <RadioList
                      name="housing.financiallySupportedNonProfit"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_UNSURE_LIST"
                    />
                    <InputText
                      v-if="values.housing?.financiallySupportedNonProfit === BasicResponse.YES"
                      class="w-1/2 pl-0"
                      name="housing.nonProfitDescription"
                      :disabled="!editable"
                      placeholder="Name of Non-profit housing society"
                    />
                  </div>

                  <div>
                    <label>
                      <a
                        href="https://www.chf.bc.ca/find-co-op/"
                        target="_blank"
                      >
                        Housing co-operative
                      </a>
                    </label>
                    <RadioList
                      name="housing.financiallySupportedHousingCoop"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_UNSURE_LIST"
                    />
                    <InputText
                      v-if="values.housing?.financiallySupportedHousingCoop === BasicResponse.YES"
                      class="w-1/2 pl-0"
                      name="housing.housingCoopDescription"
                      :disabled="!editable"
                      placeholder="Name of Housing co-operative"
                    />
                  </div>
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <span
                  class="section-header"
                  role="heading"
                  aria-level="2"
                >
                  {{ t('submissionIntakeForm.projectDescriptionCard') }}
                </span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="col-span-12 my-0 py-0">
                  <div class="flex items-center">
                    <label>Provide additional information</label>
                    <Tooltip
                      class="pl-2 mb-2"
                      right
                      icon="fa-solid fa-circle-question"
                      :text="t('submissionIntakeForm.additionalInfoTooltip')"
                    />
                  </div>
                </div>

                <!-- eslint-disable max-len -->
                <TextArea
                  class="col-span-12 mb-0 pb-0"
                  name="housing.projectDescription"
                  placeholder="Provide us with additional information - short description about the project and/or project website link"
                  :disabled="!editable"
                />
                <!-- eslint-enable max-len -->
                <label class="col-span-12 mt-0 pt-0">
                  Upload documents about your housing project (pdfs, maps,
                  <a
                    href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
                    target="_blank"
                    class="text-blue-500 underline"
                  >
                    shape files
                  </a>
                  , etc)
                </label>
                <AdvancedFileUpload
                  :activity-id="activityId"
                  :disabled="!editable"
                />
              </template>
            </Card>
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
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <NaturalDisasterCard :editable="editable" />

            <LocationCard
              ref="locationRef"
              :editable="editable"
            />

            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span
                      class="section-header"
                      role="heading"
                      aria-level="2"
                    >
                      {{ t('submissionIntakeForm.additionalLocationCard') }}
                    </span>
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <Accordion
                  collapse-icon="pi pi-chevron-up"
                  expand-icon="pi pi-chevron-right"
                  :value="parcelAccordionIndex"
                >
                  <AccordionPanel value="0">
                    <AccordionHeader>Parcel ID (PID Number)</AccordionHeader>
                    <AccordionContent>
                      <Card class="no-shadow">
                        <template #content>
                          <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-12">
                              <label>
                                <a
                                  href="https://ltsa.ca/property-owners/about-land-records/property-information-resources/"
                                  target="_blank"
                                >
                                  LTSA PID Lookup
                                </a>
                              </label>
                            </div>
                            <!-- eslint-disable max-len -->
                            <InputText
                              class="col-span-12"
                              name="location.ltsaPidLookup"
                              :bold="false"
                              :disabled="!editable"
                              help-text="List the parcel IDs - if multiple PIDS, separate them with commas, e.g., 006-209-521, 007-209-522"
                            />
                            <!-- eslint-enable max-len -->
                          </div>
                        </template>
                      </Card>
                    </AccordionContent>
                  </AccordionPanel>
                </Accordion>
                <Accordion
                  collapse-icon="pi pi-chevron-up"
                  expand-icon="pi pi-chevron-right"
                  :value="geomarkAccordionIndex"
                  class="mt-6 mb-2"
                >
                  <AccordionPanel value="0">
                    <AccordionHeader>Geomark</AccordionHeader>
                    <AccordionContent>
                      <Card class="no-shadow">
                        <template #content>
                          <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-12">
                              <label>
                                <a
                                  href="https://apps.gov.bc.ca/pub/geomark/overview"
                                  target="_blank"
                                >
                                  Open Geomark Web Service
                                </a>
                              </label>
                            </div>
                            <InputText
                              class="col-span-12"
                              name="location.geomarkUrl"
                              :bold="false"
                              :disabled="!editable"
                              placeholder="Type in URL"
                            />
                          </div>
                        </template>
                      </Card>
                    </AccordionContent>
                  </AccordionPanel>
                </Accordion>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex items-center">
                  <div class="flex grow">
                    <span
                      class="section-header"
                      role="heading"
                      aria-level="2"
                    >
                      {{ t('submissionIntakeForm.projectLocationDescriptionCard') }}
                    </span>
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <TextArea
                  class="col-span-12"
                  name="location.projectLocationDescription"
                  :disabled="!editable"
                />
              </template>
            </Card>

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
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <div class="flex">
                  <span
                    class="section-header"
                    role="heading"
                    aria-level="2"
                  >
                    {{ t('submissionIntakeForm.provincialPermitsCard') }}
                  </span>
                  <Tooltip
                    class="mb-2"
                    right
                    icon="fa-solid fa-circle-question"
                    :text="t('submissionIntakeForm.appliedPermitsTooltip')"
                  />
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <FieldArray
                  v-slot="{ fields, push, remove }"
                  name="appliedPermits"
                >
                  <RadioList
                    name="permits.hasAppliedProvincialPermits"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                    @on-change="(e: string) => onPermitsHasAppliedChange(e, fields.length, push, setFieldValue)"
                  />
                  <div
                    v-if="
                      values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
                      values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
                    "
                    ref="appliedPermitsContainer"
                  >
                    <div class="mb-2">
                      <span class="app-primary-color">
                        {{ t('submissionIntakeForm.appliedPermitsShareNotification') }}
                      </span>
                    </div>
                    <Card class="no-shadow">
                      <template #content>
                        <div
                          v-for="(permit, idx) in fields"
                          :key="idx"
                          :index="idx"
                          class="grid grid-cols-3 gap-3"
                        >
                          <div>
                            <input
                              type="hidden"
                              :name="`appliedPermits[${idx}].permitId`"
                            />
                            <Select
                              :disabled="!editable"
                              :name="`appliedPermits[${idx}].permitTypeId`"
                              placeholder="Select Permit type"
                              :options="getPermitTypes"
                              :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
                              option-value="permitTypeId"
                              :loading="getPermitTypes === undefined"
                            />
                          </div>
                          <InputText
                            :name="`appliedPermits[${idx}].permitTracking[0].trackingId`"
                            :disabled="!editable"
                            placeholder="Tracking #"
                          />
                          <div class="flex justify-center">
                            <DatePicker
                              class="w-full"
                              :name="`appliedPermits[${idx}].submittedDate`"
                              :disabled="!editable"
                              placeholder="Date applied"
                              :max-date="new Date()"
                            />
                            <div class="flex items-center ml-2 mb-4">
                              <Button
                                v-if="editable"
                                class="p-button-lg p-button-text p-button-danger p-0"
                                aria-label="Delete"
                                @click="remove(idx)"
                              >
                                <font-awesome-icon icon="fa-solid fa-trash" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          v-if="editable"
                          class="w-full flex justify-center font-bold h-10"
                          @click="
                            push({
                              permitTypeId: undefined,
                              trackingId: undefined,
                              submittedDate: undefined
                            });
                            nextTick(() => {
                              const addedPermit = getHTMLElement(
                                $refs.appliedPermitsContainer as HTMLElement,
                                'div[name*=\'permitTypeId\'] span[role=\'combobox\']'
                              );
                              if (addedPermit) {
                                addedPermit.focus();
                              }
                            });
                          "
                        >
                          <font-awesome-icon
                            icon="fa-solid fa-plus"
                            fixed-width
                          />
                          Add permit
                        </Button>
                      </template>
                    </Card>
                  </div>
                </FieldArray>
              </template>
            </Card>
            <Card>
              <template #content>
                <span class="flex font-bold">
                  <p>
                    Go to
                    <a
                      class="no-underline"
                      href="https://permitconnectbc.gov.bc.ca/#authorizations"
                      target="_blank"
                    >
                      Permit Connect BC
                    </a>
                    to learn more about permits issued by the provincial government
                  </p>
                </span>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex">
                  <span
                    class="section-header"
                    role="heading"
                    aria-level="2"
                  >
                    {{ t('submissionIntakeForm.investigatePermitsCard') }}
                  </span>
                  <Tooltip
                    right
                    icon="fa-solid fa-circle-question"
                    :text="t('submissionIntakeForm.potentialPermitsTooltip')"
                  />
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <FieldArray
                  v-slot="{ fields, push, remove }"
                  name="investigatePermits"
                >
                  <Card class="no-shadow">
                    <template #content>
                      <div ref="investigatePermitsContainer">
                        <div
                          v-for="(permit, idx) in fields"
                          :key="idx"
                          :index="idx"
                          class="grid grid-cols-3"
                        >
                          <div class="col-span-1">
                            <div class="flex">
                              <Select
                                class="w-full"
                                :disabled="!editable"
                                :name="`investigatePermits[${idx}].permitTypeId`"
                                placeholder="Select Permit type"
                                :options="getPermitTypes"
                                :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
                                option-value="permitTypeId"
                                :loading="getPermitTypes === undefined"
                              />
                              <div class="flex items-center ml-2 mb-6">
                                <Button
                                  v-if="editable"
                                  class="p-button-lg p-button-text p-button-danger p-0"
                                  aria-label="Delete"
                                  @click="remove(idx)"
                                >
                                  <font-awesome-icon icon="fa-solid fa-trash" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          v-if="editable"
                          class="w-full flex justify-center font-bold h-10"
                          @click="
                            push({ permitTypeId: undefined });
                            nextTick(() => {
                              const newPermitDropdown = getHTMLElement(
                                $refs.investigatePermitsContainer as HTMLElement,
                                'div[name*=\'investigatePermits\'] span[role=\'combobox\']'
                              );
                              if (newPermitDropdown) {
                                newPermitDropdown.focus();
                              }
                            });
                          "
                        >
                          <font-awesome-icon
                            icon="fa-solid fa-plus"
                            fixed-width
                          />
                          Add permit
                        </Button>
                      </div>
                    </template>
                  </Card>
                </FieldArray>
              </template>
            </Card>
            <Card>
              <template #content>
                <div class="mb-2 flex items-center">
                  <Checkbox
                    class="m-0 inline-block"
                    name="basic.consentToFeedback"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <span class="font-bold inline">
                    Check this box if you agree to be contacted for user feedback, helping us improve our digital
                    service. Your personal information will not be shared with third parties.
                  </span>
                </div>
              </template>
            </Card>

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
  </div>
</template>

<style scoped lang="scss">
.app-error-color {
  color: var(--p-red-500) !important;
}

.message-banner {
  border-left-color: var(--p-red-500);
  border-left-width: 5px;
  border-left-style: solid;
  border-radius: 3px;
  margin-bottom: 1rem;

  :deep(.p-message-content) {
    padding: 0.5rem;
    background-color: var(--p-red-50) !important;
  }
}

.no-shadow {
  box-shadow: none;
}

:deep(.p-step) {
  button {
    padding: 0;
  }
}

:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: var(--p-red-500) !important;
}
</style>
