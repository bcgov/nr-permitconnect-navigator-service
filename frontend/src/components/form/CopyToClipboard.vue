<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { Button, useToast } from '@/lib/primevue';
import { BUTTON_MODE } from '@/utils/enums';

// Props
type Props = {
  mode?: BUTTON_MODE;
  toCopy?: string;
};

const props = withDefaults(defineProps<Props>(), {
  mode: BUTTON_MODE.BUTTON,
  toCopy: undefined
});

// Actions
const toast = useToast();

const copyToClipboard = () => {
  if (props.toCopy) {
    navigator.clipboard.writeText(props.toCopy);
    toast.info('Copied to clipboard');
  }
};
</script>

<template>
  <Button
    v-if="mode === BUTTON_MODE.ICON"
    class="p-button-rounded p-button-secondary p-button-outlined"
    @click="copyToClipboard"
  >
    <font-awesome-icon icon="fa fa-clipboard" />
  </Button>
  <Button
    v-if="mode === BUTTON_MODE.BUTTON"
    class="p-button-outlined p-button-secondary"
    @click="copyToClipboard"
  >
    <font-awesome-icon
      icon="fa fa-clipboard"
      class="mr-2"
    />
    Copy to clipboard
  </Button>
</template>
