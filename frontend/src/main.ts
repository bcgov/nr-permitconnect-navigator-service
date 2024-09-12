import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import PrimeVue from '@primevue/core/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';

import App from '@/App.vue';
import i18n from '@/i18n';
import getRouter from '@/router';
import { ThemeOverride } from '@/ThemeOverride';
import { AuthService, ConfigService } from '@/services';

import '@bcgov/bc-sans/css/BCSans.css';
// import 'primevue/resources/themes/saga-blue/theme.css';
// import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/assets/main.scss';

import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
    content: {
      background: '{border.radius.md}'
    }
  }
});

/**
 * @function initializeApp
 * Initializes and mounts the Vue instance
 */
function initializeApp(): void {
  library.add(fas);

  const app = createApp(App);
  const pinia = createPinia();
  pinia.use(
    createPersistedState({
      key: (id) => `nr-permitting-navigator-service.${id}`
    })
  );

  app.use(pinia);
  app.use(getRouter());
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: '.p-app-dark',
        cssLayer: false
      }
    }
  });
  app.use(ToastService);
  app.use(ConfirmationService);
  app.component('FontAwesomeIcon', FontAwesomeIcon);
  app.directive('tooltip', Tooltip);

  app.mount('#app');
}

/**
 * @function initializeServices
 * Initializes and mounts the service singletons
 * Services must load in the following order: config, auth, then app.
 * @param {Function} [next=undefined] Optional callback function
 */
async function initializeServices(next?: Function): Promise<void> {
  await ConfigService.init();
  await AuthService.init();
  if (next) next();
}

initializeServices(initializeApp);
