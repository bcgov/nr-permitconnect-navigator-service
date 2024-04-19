<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Button, Card, Divider, useToast } from '@/lib/primevue';
import NoteModal from '@/components/note/NoteModal.vue';
import { noteService, userService } from '@/services';
import { formatDate, formatDateShort } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
type Props = {
  note: Note;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['note:delete', 'note:edit']);

// State
const userName: Ref<string> = ref('');
const noteModalVisible: Ref<boolean> = ref(false);
const editNoteData: Ref<Note | undefined> = ref(undefined);

// Actions
const toast = useToast();

const editNote = (note: Note) => {
  editNoteData.value = note;
  noteModalVisible.value = true;
};

const onNoteSubmit = async (data: Note) => {
  editNoteData.value = undefined;

  try {
    const newNote = (await noteService.updateNote(data)).data;
    emit('note:edit', newNote, data.noteId);
    toast.success('Note saved');
  } catch (e: any) {
    toast.error('Failed to save note', e.message);
  } finally {
    noteModalVisible.value = false;
  }
};

const onNoteDelete = (noteId: string) => {
  emit('note:delete', noteId);
};

onMounted(() => {
  if (props.note.createdBy) {
    userService.searchUsers({ userId: [props.note.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card :id="props.note.noteId">
    <template #title>
      <div class="flex align-items-center">
        <div class="flex-grow-1">
          <h3 class="mb-0">
            {{ props.note.title }}
            <span
              v-if="props.note.bringForwardState"
              data-test="bf-title"
            >
              {{ `(${props.note.bringForwardState})` }}
            </span>
          </h3>
        </div>
        <Button
          class="p-button-outlined"
          aria-label="Edit"
          @click="editNote(props.note)"
        >
          <font-awesome-icon
            class="pr-2"
            icon="fa-solid fa-edit"
          />
          Edit
        </Button>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Date:</span>
              {{ props.note.createdAt ? formatDateShort(props.note.createdAt) : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Note type:</span>
              {{ props.note.noteType }}
            </p>
          </div>
        </div>
        <div
          v-if="props.note.bringForwardDate"
          class="col-12 md:col-6 lg:col-3"
        >
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Bring forward date:</span>
              {{ props.note.bringForwardDate ? formatDate(props.note.bringForwardDate) : '' }}
            </p>
          </div>
        </div>
        <p class="col-12 mt-0 mb-0 note-content">{{ props.note.note }}</p>
      </div>
    </template>
  </Card>
  <NoteModal
    v-model:visible="noteModalVisible"
    :note="editNoteData"
    @note:delete="onNoteDelete"
    @note:submit="onNoteSubmit"
  />
</template>

<style scoped lang="scss">
p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}

.p-card {
  border-style: solid;
  border-width: 1px;

  :deep(.p-card-content) {
    padding-bottom: 0;
  }
}
.note-content {
  white-space: pre;
  text-wrap: balance;
}
</style>
