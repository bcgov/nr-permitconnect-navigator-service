<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Breadcrumb, Button, Card, RadioButton } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

// State
const acceptDisclaimer: Ref<boolean> = ref(false);
const crumbItems: Ref<Array<{ label: string; url?: string }>> = ref([]);
const enquiryOrIntake: Ref<string | undefined> = ref(undefined);

// Actions
const router = useRouter();

function getRoutePath(routeName: string) {
  const allRoutes = router.getRoutes();
  const route = allRoutes.find((route) => route.name === routeName);
  return route?.path;
}

const handleStartApplication = () => {
  if (enquiryOrIntake.value?.includes(RouteNames.INTAKE) || enquiryOrIntake.value?.includes(RouteNames.ENQUIRY))
    router.push({ name: enquiryOrIntake.value });
};

onMounted(() => {
  crumbItems.value = [
    { label: 'Home', url: getRoutePath(RouteNames.HOME) },
    { label: 'PermitConnect Housing Navigator Service' }
  ];
});
</script>

<template>
  <div class="flex justify-content-left">
    <Breadcrumb
      class="breadcrumb-start"
      :model="crumbItems"
    >
      <template #separator>/</template>
    </Breadcrumb>
  </div>
  <div
    v-if="!enquiryOrIntake"
    class="container text-left pl-6 pr-6"
  >
    <Card class="custom-card">
      <template #title>
        <h4 class="mt-1 mb-3">Start a PermitConnect Housing Navigator Service application</h4>
      </template>
      <template #content>
        <div class="disclaimer">
          <p>
            <b>
              Apply for the PermitConnect Housing Navigator Service if you are working or getting started on a project
            </b>
          </p>
          <Button
            class="btn-apply"
            @click="enquiryOrIntake = RouteNames.INTAKE"
          >
            Start application
          </Button>
        </div>
      </template>
    </Card>
    <Card class="custom-card">
      <template #title>
        <h4 class="mt-5 mb-3">Submit an enquiry</h4>
      </template>
      <template #content>
        <div class="disclaimer">
          <p>
            <b>
              Submit an enquiry if you have general questions, urgent requests, or want an update on your Application
            </b>
          </p>
          <Button
            class="btn-apply"
            @click="enquiryOrIntake = RouteNames.ENQUIRY"
          >
            Start enquiry
          </Button>
        </div>
      </template>
    </Card>
  </div>
  <div
    v-else-if="enquiryOrIntake"
    class="container text-left pl-6 pr-6"
  >
    <Card class="custom-card">
      <template #title>
        <h4 class="mt-1 mb-3">Notice for collection, use and disclosure of personal information</h4>
      </template>
      <template #content>
        <div class="disclaimer">
          <p>
            This information is being collected under the legal authority of section 26 (c) and 27 (1)(a)(i) of the
            Freedom of Information and Protection of Privacy Act (the Act) and is being used for the purpose of creating
            a client relationship between you or your organization and Government of British Columbia. It may also be
            shared when strictly necessary with partner agencies that are also subject to the provisions of the Act.
            Personal information may be used by the Permitting Solutions Office for survey purposes. If you have any
            questions regarding the use of this personal information, please contact Housing Authorizations at
            <a href="mailto:Housing.Authorizations@gov.bc.ca">Housing.Authorizations@gov.bc.ca.</a>
          </p>
        </div>
      </template>
    </Card>
    <Card class="custom-card">
      <template #title>
        <h4 class="mt-3 mb-3">Before you begin</h4>
      </template>
      <template #content>
        <div class="disclaimer">
          <p class="text-red-500">
            Please connect with your local government for requirements on local zoning, bylaws, and permitting rules. We
            advise that you engage with First Nations on land and resource decisions as early as possible, if
            applicable. Go to
            <a
              href="https://permitconnectbc.gov.bc.ca/#engaging"
              target="”_blank”"
            >
              Permit Connect BC
            </a>
            for more information.
            <span class="underline">
              Please be aware that the Navigators Service cannot overrule the timelines and decisions of other line of
              businesses.
            </span>
          </p>
        </div>
      </template>
    </Card>
    <div class="flex flex-wrap gap-3 justify-content-between mt-3">
      <div>
        <RadioButton
          v-model="acceptDisclaimer"
          :value="true"
          @click="acceptDisclaimer = !acceptDisclaimer"
        />
        <label class="ml-2">
          <span class="default-color">
            <b>Yes, I understand</b>
          </span>
          <span class="pl-1 text-red-500">*</span>
        </label>
        <div />
      </div>
      <Button
        :label="enquiryOrIntake.includes(RouteNames.INTAKE) ? 'Start application' : 'Start enquiry'"
        outlined
        class="ml-2"
        :disabled="!acceptDisclaimer"
        @click="handleStartApplication"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.p-breadcrumb {
  border: none;
  text-decoration: none;
}

.disclaimer {
  border-width: 1px;
  border-style: solid;
  border-radius: 0.5rem;
  border-color: var(--surface-300);
  padding: 0rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.default-color {
  color: var(--text-color);
}

.p-menuitem-link {
  text-decoration: none !important;
}

.btn-apply {
  width: 10rem;
  justify-content: center;
}

:deep(.breadcrumb-start) {
  li:last-child > a {
    text-decoration: none;
    font-weight: bold;
    pointer-events: none;
    .p-menuitem-text {
      color: var(--text-color);
    }
  }

  .p-menuitem-text {
    color: $app-link-text;
  }

  .p-menuitem {
    color: $app-link-text;
  }
}

:deep(.p-card-body) {
  padding: 0px;
  margin-bottom: 0.5rem;
}

:deep(.p-card-content) {
  padding: 0px;
}

.custom-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
