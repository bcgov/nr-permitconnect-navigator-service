<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { roadmapService } from '@/services';
import { useAuthStore } from '@/store';

// Props
type Props = {
  activityId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// store
const { getProfile } = storeToRefs(useAuthStore());

// local state
const emailTo = ref(getProfile.value?.email);
const emailFrom = ref(getProfile.value?.email);
const emailBody = ref('test');
const confirmation = ref('');

const updateRoadmap = async () => {
  const emailData = {
    body: emailBody.value,
    from: emailFrom.value,
    to: [emailTo.value],
    subject: 'test',
    bodyType: 'text'
    // cc: this.showCcBcc ? this.form.cc : [],
    // delayTS: this.form.datetime !== null ? new Date(this.form.datetime).getTime() : 0,
    // attachments: this.form.attachments,
    // bcc: this.showCcBcc ? this.form.bcc : [],
    // priority: this.form.priority,
    // tag: this.form.tag,
  };

  // update roadmap
  confirmation.value = (await roadmapService.update(props.activityId, emailData)).data;
};
</script>

<template>
  <Button
    aria-label="create roadmap item"
    @click="updateRoadmap()"
  >
    Update Roadmap
  </Button>
  <pre>{{ confirmation }}</pre>
</template>
