<script setup lang="ts">
import { Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { object, string } from 'yup';

import { FormNavigationGuard, InputText, InputMask, Select } from '@/components/form';
import { Button, Card, useToast } from '@/lib/primevue';
import { contactService } from '@/services';
import { useContactStore } from '@/store';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/housing';
import { setEmptyStringsToNull } from '@/utils/utils';
import { emailValidator } from '@/validators/common';

import type { Contact } from '@/types';
import type { Ref } from 'vue';

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);

// Form validation schema
// TODO: Sync contact key naming so common validator can be used
const contactSchema = object({
  firstName: string().required().max(255).label('First name'),
  lastName: string().max(255).label('Last name').nullable(),
  email: emailValidator('Email must be valid').required().label('Email'),
  phoneNumber: string().required().label('Phone'),
  contactApplicantRelationship: string().required().label('Relationship to project'),
  contactPreference: string().required().label('Preferred contact method')
});

// Actions
const { t } = useI18n();
const toast = useToast();

// Store
const contactStore = useContactStore();

const onSubmit = async (values: any) => {
  try {
    const submitData: Contact = setEmptyStringsToNull(values);
    const result = await contactService.updateContact(submitData);
    if (result.status === 200) {
      toast.success(t('contactProfileView.formSaved'));
      formRef.value?.resetForm({
        values: {
          ...formRef.value?.values
        }
      });
      contactStore.setContact(submitData);
    } else toast.error(t('contactProfileView.failedToSaveTheForm'));
  } catch (e: any) {
    toast.error(t('contactProfileView.failedToSaveTheForm'), e);
  }
};

onMounted(async () => {
  initialFormValues.value = {
    ...contactStore.getContact
  };
});
</script>

<template>
  <div class="flex justify-center">
    <h2>{{ t('contactProfileView.fillOutProfile') }}</h2>
  </div>

  <div class="flex justify-center">
    <Card>
      <template #title>
        <div class="flex justify-between">
          <div class="inline">
            <font-awesome-icon
              icon="fa-solid fa-user"
              class="mr-3 app-primary-color"
            />
            <h3 class="inline">{{ t('contactProfileView.contactProfile') }}</h3>
          </div>
        </div>
      </template>
      <template #content>
        <Form
          v-if="initialFormValues"
          v-slot="{ meta }"
          ref="formRef"
          :validation-schema="contactSchema"
          :initial-values="initialFormValues"
          @submit="onSubmit"
        >
          <FormNavigationGuard />
          <InputText
            name="firstName"
            :label="t('contactProfileView.firstName')"
          />
          <InputText
            name="lastName"
            :label="t('contactProfileView.lastName')"
          />
          <InputText
            name="email"
            :label="t('contactProfileView.email')"
            :disabled="true"
          />
          <InputMask
            name="phoneNumber"
            mask="(999) 999-9999"
            :label="t('contactProfileView.phone')"
          />
          <Select
            name="contactApplicantRelationship"
            :label="t('contactProfileView.relationshipToProject')"
            :bold="true"
            :options="PROJECT_RELATIONSHIP_LIST"
          />
          <Select
            name="contactPreference"
            :label="t('contactProfileView.preferredContact')"
            :bold="true"
            :options="CONTACT_PREFERENCE_LIST"
          />
          <div class="field flex">
            <div class="flex-auto mt-3 mb-6">
              <Button
                class="mr-2"
                :label="t('contactProfileView.save')"
                :disabled="!meta.dirty"
                type="submit"
                icon="pi pi-check"
              />
            </div>
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-card-body) {
  width: 35rem;
  box-shadow: 0 0 0.2rem #036;
  padding-bottom: 0;
}
</style>
