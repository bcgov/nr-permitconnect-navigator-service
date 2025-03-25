<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button, Card, Divider } from '@/lib/primevue';
import { useAuthNStore } from '@/store';
import { IdentityProviderKind } from '@/utils/enums/application';
import { findIdpConfig } from '@/utils/utils';

// Actions
const { t } = useI18n();

function login(kind: IdentityProviderKind) {
  const idpCfg = findIdpConfig(kind);
  if (idpCfg) useAuthNStore().login(idpCfg.idp);
}
</script>

<template>
  <div class="flex justify-center mt-7">
    <Card class="flex items-center card">
      <template #title>
        <div>
          <h3 class="mb-0 mx-2">{{ t('oidcLoginView.login') }}</h3>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col justify-center mx-2">
          <Button
            class="mb-3"
            data-test="bcsc-login-button"
            :aria-label="t('oidcLoginView.loginBCServicesCard')"
            @click="login(IdentityProviderKind.BCSC)"
          >
            {{ t('oidcLoginView.loginBCServicesCard') }}
          </Button>
          <Button
            class="mb-3"
            data-test="bceid-login-button"
            :aria-label="t('oidcLoginView.loginBasicBCeID')"
            @click="login(IdentityProviderKind.BCEID)"
          >
            {{ t('oidcLoginView.loginBasicBCeID') }}
          </Button>
          <Button
            class="mb-3"
            data-test="bceid-business-login-button"
            :aria-label="t('oidcLoginView.loginBusinessBCeID')"
            @click="login(IdentityProviderKind.BCEIDBUSINESS)"
          >
            {{ t('oidcLoginView.loginBusinessBCeID') }}
          </Button>

          <Divider />

          <h4 class="my-3">{{ t('oidcLoginView.internalGovUsers') }}</h4>

          <Button
            class="p-button-outlined"
            data-test="idir-login-button"
            :aria-label="t('oidcLoginView.loginIDIR')"
            @click="login(IdentityProviderKind.IDIR)"
          >
            {{ t('oidcLoginView.loginIDIR') }}
          </Button>
          <div class="my-3">
            <Divider />
          </div>

          <h4 class="mb-3">{{ t('oidcLoginView.register') }}</h4>
          <div class="account-setup p-2 mb-3">
            <a
              class="mb-3 mr-1"
              href="https://id.gov.bc.ca/account/"
              target="_blank"
            >
              {{ t('oidcLoginView.setupBCServicesCard') }}
            </a>
            <span>{{ t('oidcLoginView.BCServicesCardRequirement') }}</span>
          </div>
          <div class="account-setup p-2 mb-3">
            <a
              class="mb-3 mr-1"
              href="https://www.bceid.ca/register/basic/account_details.aspx?type=regular&eServiceType=basic"
              target="_blank"
            >
              {{ t('oidcLoginView.getBasicBCeID') }}
            </a>
            <span>{{ t('oidcLoginView.BCeIDRequirement') }}</span>
          </div>

          <div class="account-setup p-2">
            <a
              class="mb-3 mr-1"
              href="https://www.bceid.ca/register/business/getting_started/getting_started.aspx"
              target="_blank"
            >
              {{ t('oidcLoginView.getBusinessBCeID') }}
            </a>
            <span>{{ t('oidcLoginView.BusinessBCeIDRequirement') }}</span>
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

.card {
  width: 28.75rem;
  height: 48.25rem;
}
</style>
