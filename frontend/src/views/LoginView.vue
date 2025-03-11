<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button, Card, Divider } from '@/lib/primevue';

// Actions
const { t } = useI18n();
</script>

<template>
  <div class="flex justify-center mt-7">
    <Card class="flex items-center w-1/3">
      <template #title>
        <div>
          <h3 class="mb-0 mx-2">{{ t('loginView.login') }}</h3>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col justify-center mx-2">
          <Button class="mb-3">
            {{ t('loginView.loginBCServicesCard') }}
          </Button>
          <Button class="mb-3">
            {{ t('loginView.loginBasicBCeID') }}
          </Button>
          <Button class="mb-3">{{ t('loginView.loginBusinessBCeID') }}</Button>

          <Divider />

          <h4 class="my-3">{{ t('loginView.internalGovUsers') }}</h4>

          <Button class="p-button-outlined">{{ t('loginView.loginIDIR') }}</Button>
          <div class="my-3">
            <Divider />
          </div>

          <h4 class="mb-3">{{ t('loginView.register') }}</h4>
          <div class="account-setup p-2 mb-3">
            <a
              class="mb-3 mr-1"
              href="https://id.gov.bc.ca/account/"
            >
              {{ t('loginView.setupBCServicesCard') }}
            </a>
            <span>{{ t('loginView.BCServicesCardRequirement') }}</span>
          </div>
          <div class="account-setup p-2 mb-3">
            <a
              class="mb-3 mr-1"
              href="https://www.bceid.ca/register/basic/account_details.aspx?type=regular&eServiceType=basic"
            >
              {{ t('loginView.getBasicBCeID') }}
            </a>
            <span>{{ t('loginView.BCeIDRequirement') }}</span>
          </div>

          <div class="account-setup p-2">
            <a
              class="mb-3 mr-1"
              href="https://www.bceid.ca/register/business/getting_started/getting_started.aspx"
            >
              {{ t('loginView.getBusinessBCeID') }}
            </a>
            <span>{{ t('loginView.BusinessBCeIDRequirement') }}</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.account-setup {
  outline: solid 0.063rem $app-grey;
  border-radius: 0.5rem;
}
</style>
