<script setup lang="ts">
import { PermitAuthorizationStatus, PermitTrackerStatus } from '@/utils/enums/housing';

import StatusMarks from '@/components/housing/projects/StatusMarks.vue';

// Props
type Props = {
  authStatus: string | undefined;
};

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div>
    <div
      v-if="!props.authStatus || props.authStatus === PermitAuthorizationStatus.NONE"
      class="grid m-0"
    >
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.SUBMITTED"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          empty
          :label="PermitTrackerStatus.PENDING"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          empty
          :label="PermitTrackerStatus.COMPLETED"
        />
      </div>
    </div>
    <div
      v-else-if="props.authStatus === PermitAuthorizationStatus.IN_REVIEW"
      class="grid m-0"
    >
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.SUBMITTED"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.IN_REVIEW"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          empty
          :label="PermitTrackerStatus.COMPLETED"
        />
      </div>
    </div>
    <div
      v-else-if="props.authStatus === PermitAuthorizationStatus.PENDING"
      class="grid m-0"
    >
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.SUBMITTED"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          exclamation
          :label="PermitTrackerStatus.PENDING"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          empty
          :label="PermitTrackerStatus.COMPLETED"
        />
      </div>
    </div>
    <div
      v-else-if="props.authStatus === PermitAuthorizationStatus.ISSUED"
      class="grid m-0"
    >
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.SUBMITTED"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.IN_REVIEW"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.COMPLETED"
        />
      </div>
    </div>

    <div
      v-else-if="props.authStatus === PermitAuthorizationStatus.DENIED"
      class="grid m-0"
    >
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          label="Issued"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          checkmark
          :label="PermitTrackerStatus.IN_REVIEW"
        />
      </div>
      <div class="col-4 p-0">
        <StatusMarks
          exclamation
          :label="PermitTrackerStatus.DENIED"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
font-awesome-icon {
  height: 1rem;
  width: 1rem;
}
.empty {
  color: transparent;
  border: 1px dotted grey;
  border-radius: 50%;
}

.check {
  color: $app-green;
}

.exclaim {
  color: $app-error;
}

.solid {
  stroke-dasharray: none;
}
.dashed {
  stroke-dasharray: 8, 8.5;
}
.dotted {
  stroke-dasharray: 0.1, 12.5;
  stroke-linecap: round;
}
</style>
