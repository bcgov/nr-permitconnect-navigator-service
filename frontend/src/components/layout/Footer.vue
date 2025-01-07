<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// Actions
const { t } = useI18n();
</script>

<template>
  <div class="gov-footer flex flex-col pt-8">
    <div class="acknowledgement px-20 py-8">
      {{ t('footer.acknowledgement') }}
    </div>
    <div class="container px-20 py-8">
      <div class="content pb-8">
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
                {{ t('footer.contact1') }}
                <a href="https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111">{{ t('footer.contact2') }}</a>{{ t('footer.contact3') }}
                <a href="https://www2.gov.bc.ca/gov/content?id=FBC4210F6BC047A5884198F543C97D53">{{ t('footer.contact4') }}</a>
              </p>
            </div>
          </div>
          <div class="links pr-20">
            <p class="font-bold">{{ t('footer.moreInfo') }}</p>
            <div class="flex">
              <div class="flex flex-col pr-20">
                <a href="https://www2.gov.bc.ca/gov/content/home">{{ t('footer.home') }}</a>
                <a href="https://www2.gov.bc.ca/gov/content?id=3C4F47288DFB454987435AB5EFEFBB7F">
                  {{ t('footer.about') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535">
                  {{ t('footer.disclaimer') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932">
                  {{ t('footer.privacy') }}
                </a>
              </div>
              <div class="flex flex-col">
                <a href="https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412">
                  {{ t('footer.accessibility') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA">
                  {{ t('footer.copyright') }}
                </a>
                <a href="https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111">
                  {{ t('footer.contactUs') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright pt-8">© {{ new Date().getUTCFullYear() }} {{ t('footer.gov') }}.</div>
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
    background-color: #252423 !important;
    color: #ffffff;
  }

  .container {
    background-color: #ffffff !important;
  }
  .contact {
    max-width: 400px;
  }

  .copyright {
    border-top: 1px solid var(--text-color);
  }

  .links {
    a {
      padding: 0.5rem 1rem 0.5rem 0;
      color: var(--text-color);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      &:visited {
        color: var(--text-color);
      }
    }
  }
}
</style>
