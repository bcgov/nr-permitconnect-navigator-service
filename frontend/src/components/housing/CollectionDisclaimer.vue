<script setup lang="ts">
import { Card, Divider } from '@/lib/primevue';
</script>

<template>
  <Card>
    <template #title>
      <span class="section-header">Notice for collection, use and disclosure of personal information</span>
      <Divider type="solid" />
    </template>
    <template #content>
      <p class="disclaimer">
        This information is being collected under the legal authority of section 26 (c)(e) and 27 (1)(a)(i) of the
        Freedom of Information and Protection of Privacy Act (the Act) and is being used for the purpose of creating a
        client relationship between you or your organization and Government of British Columbia. It may also be shared
        when strictly necessary with partner agencies that are also subject to the provisions of the Act. Personal
        information may be used by the Permitting Solutions Branch for survey purposes. If you have any questions
        regarding the use of this personal information, please contact Housing Authorizations at
        <a href="mailto:Housing.Authorizations@gov.bc.ca">Housing.Authorizations@gov.bc.ca.</a>
      </p>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
}

.p-card {
  border-color: rgb(242, 241, 241);
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  .section-header {
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-body) {
    padding-bottom: 0.5rem;

    padding-left: 0;
    padding-right: 0;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0;

    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
