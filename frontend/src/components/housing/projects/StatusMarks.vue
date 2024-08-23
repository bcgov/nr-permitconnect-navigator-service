<script setup lang="ts">
import { computed } from 'vue';
import { Divider } from '@/lib/primevue';

type Props = {
  label?: string;
  checkmark?: boolean;
  empty?: boolean;
  exclamation?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  label: '',
  checkmark: false,
  empty: false,
  exclamation: false
});

const iconString = computed(() => {
  if (props.checkmark) return 'fas fa-circle-check';
  if (props.empty) return 'fa fa-circle';
  if (props.exclamation) return 'fa fa-exclamation-circle';
  return '';
});
</script>
``

<template>
  <div>
    <div class="flex align-items-center">
      <font-awesome-icon
        :class="{ checkmark: props.checkmark, empty: props.empty, exclamation: props.exclamation }"
        :icon="iconString"
      />
      <Divider :align="'center'" />
    </div>
    {{ props.label }}
  </div>
</template>

<style scoped lang="scss">
font-awesome-icon {
  height: 1rem;
  width: 1rem;
}

.checkmark {
  color: $app-green;
}

.empty {
  color: transparent;
  border: 1px dotted grey;
  border-radius: 50%;
}

.exclamation {
  color: $app-error;
}
</style>
