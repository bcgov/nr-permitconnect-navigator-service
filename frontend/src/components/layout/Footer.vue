<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// Actions
const { t } = useI18n();
</script>

<template>
  <div class="gov-footer flex flex-col pt-8">
    <div class="acknowledgement px-20 py-8">
      {{ t('common.footer.acknowledgement') }}
    </div>
    <div class="content-container px-20 py-8">
      <div class="pb-8">
        <div class="flex justify-between">
          <div class="flex flex-col">
            <div class="logo">
              <img
                src="@/assets/images/BCID_H_rgb_pos.png"
                class="bc-logo"
                alt="B.C. Government Logo"
              />
            </div>
            <div class="contact">
              <!-- prettier-ignore -->
              <p>
                {{ t('common.footer.contact1') }}
                <a href="https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111">{{ t('common.footer.contact2') }}</a>{{ t('common.footer.contact3') }}
                <a href="https://www2.gov.bc.ca/gov/content?id=FBC4210F6BC047A5884198F543C97D53">{{ t('common.footer.contact4') }}</a>
              </p>
            </div>
          </div>
          <div class="links pr-20">
            <p class="font-bold">{{ t('common.footer.moreInfo') }}</p>
            <div class="flex">
              <div class="flex flex-col pr-20">
                <a href="https://www2.gov.bc.ca/gov/content/home">{{ t('common.footer.home') }}</a>
                <a href="https://www2.gov.bc.ca/gov/content?id=3C4F47288DFB454987435AB5EFEFBB7F">
                  {{ t('common.footer.about') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535">
                  {{ t('common.footer.disclaimer') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932">
                  {{ t('common.footer.privacy') }}
                </a>
              </div>
              <div class="flex flex-col">
                <a href="https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412">
                  {{ t('common.footer.accessibility') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA">
                  {{ t('common.footer.copyright') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111">
                  {{ t('common.footer.contactUs') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright pt-8">© {{ new Date().getUTCFullYear() }} {{ t('common.footer.gov') }}.</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bc-logo {
  max-height: 60px;
  height: 60px;
}

.gov-footer {
  .acknowledgement {
    border-top: 3px solid #fcba19;
    border-bottom: 3px solid #fcba19;
    // TODO: Reference a surface colour once PrimeVue 4 changes come in
    background-color: var(--p-surface-950) !important;
    color: var(--p-surface-0);
  }

  .content-container {
    background-color: var(--p-surface-0);
    width: 100%;
  }

  .contact {
    max-width: 400px;
  }

  .copyright {
    border-top: 1px solid var(--p-surface-950);
  }

  .links {
    a {
      padding: 0.5rem 1rem 0.5rem 0;
      color: var(--p-text-color);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      &:visited {
        color: var(--p-text-color);
      }
    }
  }
}
</style>
