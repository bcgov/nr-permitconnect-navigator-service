<script setup lang="ts">
import { PermitAuthorizationStatus, PermitTrackerStatus } from '@/utils/enums/housing';
import { Timeline } from '@/lib/primevue';

// Props
const { authStatus = PermitAuthorizationStatus.NONE } = defineProps<{
  authStatus?: string;
}>();

// Constants
const checkmark = (trackerStatus: string) => ({
  class: 'checkmark',
  iconString: 'fas fa-circle-check',
  text: trackerStatus
});
const exclamation = (trackerStatus: string) => ({
  class: 'exclamation',
  iconString: 'fa fa-exclamation-circle',
  text: trackerStatus
});
const empty = (trackerStatus: string) => ({ class: 'empty', iconString: 'fa fa-circle', text: trackerStatus });
const end = () => ({ class: '', iconString: '', text: '' });

const iconStates = {
  [PermitAuthorizationStatus.DENIED]: [
    checkmark(PermitTrackerStatus.SUBMITTED),
    checkmark(PermitTrackerStatus.IN_REVIEW),
    exclamation(PermitAuthorizationStatus.DENIED),
    end()
  ],
  [PermitAuthorizationStatus.IN_REVIEW]: [
    checkmark(PermitTrackerStatus.SUBMITTED),
    checkmark(PermitTrackerStatus.IN_REVIEW),
    empty(PermitTrackerStatus.COMPLETED),
    end()
  ],
  [PermitAuthorizationStatus.ISSUED]: [
    checkmark(PermitTrackerStatus.SUBMITTED),
    checkmark(PermitTrackerStatus.IN_REVIEW),
    checkmark(PermitAuthorizationStatus.ISSUED),
    end()
  ],
  [PermitAuthorizationStatus.NONE]: [
    checkmark(PermitTrackerStatus.SUBMITTED),
    empty(PermitTrackerStatus.IN_REVIEW),
    empty(PermitTrackerStatus.COMPLETED),
    end()
  ],
  [PermitAuthorizationStatus.PENDING]: [
    checkmark(PermitTrackerStatus.SUBMITTED),
    exclamation(PermitTrackerStatus.PENDING),
    empty(PermitTrackerStatus.COMPLETED),
    end()
  ]
};
</script>

<template>
  <div class="grid m-0 flex flex-column gap-3">
    <Timeline
      :value="iconStates[authStatus as keyof typeof iconStates]"
      layout="horizontal"
    >
      <template #marker="slotProps">
        <font-awesome-icon
          :class="slotProps.item.class"
          :icon="slotProps.item.iconString"
        />
      </template>
      <template #content="slotProps">
        {{ slotProps.item.text }}
      </template>
    </Timeline>
  </div>
</template>

<style scoped lang="scss">
.checkmark {
  color: var(-p-green-500);
  & + :deep(.p-timeline-event-connector) {
    background-color: var(-p-green-500);
  }
}

.empty {
  color: transparent;
  border: 1px dashed var(--p-greyscale-700);
  border-radius: 50%;
  & + :deep(.p-timeline-event-connector) {
    background-color: var(--p-greyscale-700);
  }
}

.exclamation {
  color: var(--p-red-500);
  & + :deep(.p-timeline-event-connector) {
    background-color: var(--p-red-500);
  }
}

:deep(.p-timeline-event-opposite) {
  display: none;
}
</style>
