<script setup lang="ts">
import { computed } from 'vue';

import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions } from '@/utils/enums/housing';

// Props
const { authStatus, toolTipDirection = 'right' } = defineProps<{
  authStatus?: string;
  toolTipDirection?: string;
}>();

const pillState = {
  [PermitAuthorizationStatus.ABANDONED]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: PermitAuthorizationStatusDescriptions.ABANDONED
  },
  [PermitAuthorizationStatus.CANCELLED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: PermitAuthorizationStatusDescriptions.CANCELLED
  },
  [PermitAuthorizationStatus.DENIED]: {
    badgeClass: 'red',
    iconClass: '',
    iconString: 'fas fa-circle-xmark',
    toolTip: PermitAuthorizationStatusDescriptions.DENIED
  },
  [PermitAuthorizationStatus.ISSUED]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: 'fas fa-circle-check',
    toolTip: PermitAuthorizationStatusDescriptions.ISSUED
  },
  [PermitAuthorizationStatus.IN_REVIEW]: {
    badgeClass: 'green',
    iconClass: '',
    iconString: '',
    toolTip: PermitAuthorizationStatusDescriptions.IN_REVIEW
  },
  [PermitAuthorizationStatus.NONE]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: PermitAuthorizationStatusDescriptions.NONE
  },
  [PermitAuthorizationStatus.PENDING]: {
    badgeClass: 'yellow',
    iconClass: '',
    iconString: 'fas fa-circle-exclamation',
    toolTip: PermitAuthorizationStatusDescriptions.PENDING
  },
  [PermitAuthorizationStatus.WITHDRAWN]: {
    badgeClass: 'grey',
    iconClass: '',
    iconString: '',
    toolTip: PermitAuthorizationStatusDescriptions.WITHDRAWN
  }
};

const getState = computed(() => {
  return pillState[authStatus as keyof typeof pillState];
});
</script>

<template>
  <div
    v-tooltip="{ value: getState?.toolTip, modifier: toolTipDirection }"
    class="flex justify-content-center align-items-center auth-indicator"
    :class="[getState?.badgeClass]"
  >
    <font-awesome-icon
      v-if="getState?.iconString"
      class="icon-detail"
      :class="[getState?.iconClass]"
      :icon="getState?.iconString"
    />
    <span class="text-color">{{ authStatus }}</span>
  </div>
</template>

<style scoped lang="scss">
.auth-indicator {
  border-radius: 2px;
  border-style: solid;
  border-width: 0.1rem;
  font-size: 0.75rem;
  height: 1.5rem;
  line-height: 1.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  cursor: default;
  text-align: center;

  &:hover {
    border-color: #2e5dd7;
  }
}

.icon-detail {
  font-size: 1rem;
  margin-right: 0.5rem;
}

.green {
  background-color: $app-pill-lightgreen;
  border-color: $app-pill-green;
  color: $app-pill-green;
}

.grey {
  background-color: $app-pill-grey;
  border-color: $app-pill-lightgrey;
}

.outlined-green {
  background-color: $app-pill-green;
  border-color: $app-pill-green;
  border-style: solid;
  border-radius: 50%;
  color: $app-pill-lightgreen;
}

.red {
  background-color: $app-pill-lightred;
  border-color: $app-pill-red;
  color: $app-pill-red;
}

.yellow {
  background-color: $app-pill-lightyellow;
  border-color: $app-pill-yellow;
  color: $app-pill-yellow;
}

.text-color {
  font-weight: normal;
  color: $app-pill-text;
}
</style>
