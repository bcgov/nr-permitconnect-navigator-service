<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCodeStore } from '@/store';
import { PermitState } from '@/utils/enums/codeEnums';

// Props
const {
  state,
  enlarge = false,
  displayText = undefined
} = defineProps<{
  state: string;
  enlarge?: boolean;
  displayText?: string;
}>();

const defaultDimensions = {
  fontSize: '0.75rem',
  height: '1.5rem',
  iconFontSize: '1rem',
  lineHeight: '1.5rem'
};
const enlargedDimensions = {
  fontSize: '1rem',
  height: '2rem',
  iconFontSize: '1.5rem',
  lineHeight: '2rem'
};

// Composables
const { t } = useI18n();

// State
const dimensions = computed(() => (enlarge ? enlargedDimensions : defaultDimensions));
const getState = computed(() => {
  return pillState[state as keyof typeof pillState];
});

const pillState = {
  [PermitState.ACCEPTED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: t('authorization.stateDescriptions.accepted')
  },
  [PermitState.APPROVED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: 'fas fa-circle-check',
    toolTip: t('authorization.stateDescriptions.approved')
  },
  [PermitState.CANCELLED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: t('authorization.stateDescriptions.cancelled')
  },
  [PermitState.DENIED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: t('authorization.stateDescriptions.denied')
  },
  [PermitState.IN_PROGRESS]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: t('authorization.stateDescriptions.inProgress')
  },
  [PermitState.INITIAL_REVIEW]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: t('authorization.stateDescriptions.initialReview')
  },
  [PermitState.ISSUED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: 'fas fa-circle-check',
    toolTip: t('authorization.stateDescriptions.issued')
  },
  [PermitState.NONE]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: undefined
  },
  [PermitState.PENDING_APPLICANT_ACTION]: {
    badgeClass: 'yellow',
    iconClass: '',
    iconString: 'fas fa-circle-exclamation',
    toolTip: t('authorization.stateDescriptions.pendingClient')
  },
  [PermitState.REJECTED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: t('authorization.stateDescriptions.rejected')
  },
  [PermitState.WITHDRAWN]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: t('authorization.stateDescriptions.withdrawn')
  }
};

// Store
const { codeDisplay } = useCodeStore();
</script>

<template>
  <!-- eslint-disable max-len -->
  <div
    v-tooltip.right="getState?.toolTip"
    class="flex justify-center items-center rounded-sm border-solid border-[0.1rem] text-[length:var(--font-size)] h-[var(--height)] px-2 cursor-default text-center hover:!border-[#2e5dd7]"
    :class="[getState?.badgeClass]"
    :style="{
      '--font-size': dimensions.fontSize,
      '--icon-font-size': dimensions.iconFontSize,
      '--height': dimensions.height,
      '--line-height': dimensions.lineHeight
    }"
  >
    <!-- eslint-enable max-len -->
    <div
      v-tooltip.focus.right="getState?.toolTip"
      tabindex="0"
      :aria-label="getState?.toolTip"
      class="flex items-center gap-2 focus:outline-hidden"
    >
      <font-awesome-icon
        v-if="getState?.iconString"
        class="text-[length:var(--icon-font-size)]"
        aria-hidden="true"
        :class="[getState?.iconClass]"
        :icon="getState?.iconString"
      />
      <span class="font-normal text-[var(--p-greyscale-900)]">
        {{ displayText ?? codeDisplay.PermitState?.[state] ?? state }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.green {
  background-color: var(--p-support-success-surface);
  border-color: var(--p-support-success-border);
  color: var(--p-support-success-icon);
}

.grey {
  background-color: var(--p-greyscale-100);
  border-color: var(--p-greyscale-900);
}

.red {
  background-color: var(--p-support-danger-surface);
  border-color: var(--p-support-danger-border);
  color: var(--p-support-danger-icon);
}

.yellow {
  background-color: var(--p-support-warning-surface);
  border-color: var(--p-support-warning-border);
  color: var(--p-support-warning-icon);
}
</style>
