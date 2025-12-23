<script setup lang="ts">
import { ErrorMessage, Form } from 'vee-validate';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object, string } from 'yup';

import { FormNavigationGuard, InputText, InputMask, Select } from '@/components/form';
import { Button, useToast } from '@/lib/primevue';
import { contactService } from '@/services';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { setEmptyStringsToNull } from '@/utils/utils';
import { emailValidator } from '@/validators/common';

import type { GenericObject } from 'vee-validate';
import type { Contact } from '@/types';

// Props
const { contact } = defineProps<{
  contact: Contact;
}>();

// Types
type ContactForm = {
  contactId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  contactApplicantRelationship?: string;
  contactPreference?: string;
};

// Emits
const emit = defineEmits<{
  (e: 'update-contact', contact: Contact): void;
}>();

// Composables
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// State
const formRef = ref<InstanceType<typeof Form> | null>(null);
const initialFormValues = ref<ContactForm>({
  contactId: contact.contactId,
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phoneNumber: contact.phoneNumber,
  contactApplicantRelationship: contact.contactApplicantRelationship,
  contactPreference: contact.contactPreference
});

// Form validation schema
// TODO: Sync contact key naming so common validator can be used
const contactSchema = object({
  contactId: string().required(),
  firstName: string().required().max(255).label('First name'),
  lastName: string().max(255).label('Last name').nullable(),
  email: emailValidator('Email must be valid').required().label('Email'),
  phoneNumber: string().required().label('Phone'),
  contactApplicantRelationship: string().required().label('Relationship to project'),
  contactPreference: string().required().label('Preferred contact method')
}).exact('Unknown keys in schema');

const onSubmit = async (values: GenericObject | ContactForm) => {
  try {
    const submitData: Contact = setEmptyStringsToNull(values);
    const result = await contactService.updateContact(submitData);
    if (result.status === 200) {
      toast.success(t('contactForm.formSaved'));
      formRef.value?.resetForm({
        values: {
          ...formRef.value?.values
        }
      });
      emit('update-contact', result.data);
      router.back();
    } else toast.error(t('contactForm.failedToSaveTheForm'));
  } catch (e: any) {
    toast.error(t('contactForm.failedToSaveTheForm'), e);
  }
};
</script>

<template>
  <div class="px-3 pb-1">
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
        class="mb-6"
        name="firstName"
        :label="t('contactForm.firstName')"
      />
      <InputText
        class="mb-6"
        name="lastName"
        :label="t('contactForm.lastName')"
      />
      <InputText
        class="mb-6"
        name="email"
        :label="t('contactForm.email')"
        :disabled="true"
      />
      <InputMask
        class="mb-6"
        name="phoneNumber"
        mask="(999) 999-9999"
        :label="t('contactForm.phone')"
      />
      <Select
        class="mb-6"
        name="contactApplicantRelationship"
        :label="t('contactForm.relationshipToProject')"
        :bold="true"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        class="mb-7"
        name="contactPreference"
        :label="t('contactForm.preferredContact')"
        :bold="true"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <div class="flex flex-col">
        <div class="">
          <Button
            class="mr-2"
            :label="t('contactForm.save')"
            :disabled="!meta.dirty"
            type="submit"
            icon="pi pi-check"
          />
          <slot name="cancel" />
        </div>
        <ErrorMessage
          name=""
          class="app-error-message"
        />
      </div>
    </Form>
  </div>
</template>
