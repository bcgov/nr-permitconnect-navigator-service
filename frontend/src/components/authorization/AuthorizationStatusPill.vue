<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { PermitState, PermitStateDescriptions } from '@/utils/enums/permit';

// Props
const {
  state,
  enlarge = false,
  displayText
} = defineProps<{
  state?: string;
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

const pillState = {
  [PermitState.CANCELLED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: PermitStateDescriptions.CANCELLED
  },
  [PermitState.DENIED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: PermitStateDescriptions.DENIED
  },
  [PermitState.APPROVED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: 'fas fa-circle-check',
    toolTip: PermitStateDescriptions.APPROVED
  },
  [PermitState.IN_PROGRESS]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: PermitStateDescriptions.IN_PROGRESS
  },
  [PermitState.INITIAL_REVIEW]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: PermitStateDescriptions.INITIAL_REVIEW
  },
  [PermitState.ISSUED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: 'fas fa-circle-check',
    toolTip: PermitStateDescriptions.ISSUED
  },
  [PermitState.NONE]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: PermitStateDescriptions.NONE
  },
  [PermitState.PENDING_CLIENT]: {
    badgeClass: 'yellow',
    iconClass: '',
    iconString: 'fas fa-circle-exclamation',
    toolTip: PermitStateDescriptions.PENDING_CLIENT
  },
  [PermitState.REJECTED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: PermitStateDescriptions.REJECTED
  },
  [PermitState.WITHDRAWN]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: PermitStateDescriptions.WITHDRAWN
  }
};

// Composables
const { t } = useI18n();

const dimensions = computed(() => (enlarge ? enlargedDimensions : defaultDimensions));
const getState = computed(() => {
  return pillState[state as keyof typeof pillState];
});

const statePillDisplayText = {
  [PermitState.CANCELLED]: t('authorization.authorizationStatusPill.cancelledByReviewingAuthority')
};
</script>

<template>
  <div class="flex">
    <div
      v-tooltip.right="getState?.toolTip"
      class="flex justify-center items-center auth-indicator"
      :class="[getState?.badgeClass]"
      :style="{
        '--font-size': dimensions.fontSize,
        '--icon-font-size': dimensions.iconFontSize,
        '--height': dimensions.height,
        '--line-height': dimensions.lineHeight
      }"
      role="tooltip"
      :aria-label="getState?.toolTip"
    >
      <div
        v-tooltip.focus.right="getState?.toolTip"
        aria-hidden="true"
        tabindex="0"
      >
        <font-awesome-icon
          v-if="getState?.iconString"
          class="icon-detail"
          aria-hidden="true"
          :class="[getState?.iconClass]"
          :icon="getState?.iconString"
        />
        <span class="text-color">
          {{ displayText ?? statePillDisplayText[state as keyof typeof statePillDisplayText] ?? state }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-indicator {
  border-radius: 0.125rem;
  border-style: solid;
  border-width: 0.1rem;
  font-size: var(--font-size);
  height: var(--height);
  line-height: var(--line-height);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  cursor: default;
  text-align: center;

  &:hover {
    border-color: #2e5dd7;
  }
}

.icon-detail {
  font-size: var(--icon-font-height);
  margin-right: 0.5rem;
}

.green {
  background-color: var(--p-green-75);
  border-color: var(--p-green-500);
  color: var(--p-green-500);
}

.grey {
  background-color: var(--p-greyscale-100);
  border-color: var(--p-greyscale-900);
}

.outlined-green {
  background-color: var(--p-green-500);
  border-color: var(--p-green-500);
  border-style: solid;
  border-radius: 50%;
  color: var(--p-green-75);
}

.red {
  background-color: var(--p-red-50);
  border-color: var(--p-red-400);
  color: var(--p-red-400);
}

.yellow {
  background-color: var(--p-gold-200);
  border-color: var(--p-gold-900);
  color: var(--p-gold-900);
}

.text-color {
  font-weight: normal;
  color: var(--p-greyscale-900);
}
</style>
