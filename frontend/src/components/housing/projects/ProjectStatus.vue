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
  color: $app-green;
  & + :deep(.p-timeline-event-connector) {
    background-color: $app-green;
  }
}

.empty {
  color: transparent;
  border: 1px dashed $app-proj-grey-two;
  border-radius: 50%;
  & + :deep(.p-timeline-event-connector) {
    background-color: $app-proj-grey-two;
  }
}

.exclamation {
  color: $app-error;
  & + :deep(.p-timeline-event-connector) {
    background-color: $app-error;
  }
}

:deep(.p-timeline-event-opposite) {
  display: none;
}
</style>
