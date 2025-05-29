<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { object, string } from 'yup';

import { FormNavigationGuard, InputText, InputMask, Select } from '@/components/form';
import { Button, useToast } from '@/lib/primevue';
import { contactService } from '@/services';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { omit, setEmptyStringsToNull } from '@/utils/utils';
import { emailValidator } from '@/validators/common';

import type { Contact } from '@/types';

// Props
const { contact } = defineProps<{
  contact?: Contact;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update-contact', contact: Contact): void;
}>();

// Composables
const { t } = useI18n();
const toast = useToast();

// State
const formRef = ref<InstanceType<typeof Form> | null>(null);
const initialFormValues = ref<any | undefined>(contact);

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

const onSubmit = async (values: any) => {
  try {
    const submitData: Contact = omit(setEmptyStringsToNull(values), ['activityContact']) as Contact;
    const result = await contactService.updateContact(submitData);
    if (result.status === 200) {
      toast.success(t('contactForm.formSaved'));
      formRef.value?.resetForm({
        values: {
          ...formRef.value?.values
        }
      });
      emit('update-contact', submitData);
    } else toast.error(t('contactForm.failedToSaveTheForm'));
  } catch (e: any) {
    toast.error(t('contactForm.failedToSaveTheForm'), e);
  }
};
</script>

<template>
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
      :label="t('contactForm.firstName')"
    />
    <InputText
      name="lastName"
      :label="t('contactForm.lastName')"
    />
    <InputText
      name="email"
      :label="t('contactForm.email')"
      :disabled="true"
    />
    <InputMask
      name="phoneNumber"
      mask="(999) 999-9999"
      :label="t('contactForm.phone')"
    />
    <Select
      name="contactApplicantRelationship"
      :label="t('contactForm.relationshipToProject')"
      :bold="true"
      :options="PROJECT_RELATIONSHIP_LIST"
    />
    <Select
      name="contactPreference"
      :label="t('contactForm.preferredContact')"
      :bold="true"
      :options="CONTACT_PREFERENCE_LIST"
    />
    <div class="field flex">
      <div class="flex-auto mt-3 mb-6">
        <Button
          class="mr-2"
          :label="t('contactForm.save')"
          :disabled="!meta.dirty"
          type="submit"
          icon="pi pi-check"
        />
        <slot name="cancel" />
      </div>
    </div>
  </Form>
</template>
