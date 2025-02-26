<script setup lang="ts">
import { Breadcrumb } from '@/lib/primevue';

import { ref, toRaw, watch, type Ref } from 'vue';
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from 'vue-router';

const route = useRoute();

const routes: Ref<Array<RouteLocationNormalizedLoadedGeneric>> = ref([]);

const oldWatch: Ref<RouteLocationNormalizedLoadedGeneric | undefined> = ref(undefined);

// Maps a param key to a callback function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const paramMap = new Map<string, (id: string) => any>([
//   ['bc_submission', submissionStore.getSubmission],
//   ['bc_permit', submissionStore.getPermit]
// ]);

// function generateName(item: RouteLocationMatched) {
//   console.log(item.meta);
//   if (item?.meta?.breadcrumb_dynamic) {
//     console.log('dynamic');
//   } else {
//     return item.meta.breadcrumb;
//   }
// }

watch(
  route,
  async () => {
    const value = toRaw({ ...route });
    const oldValue = toRaw({ ...oldWatch.value });

    const matched = value.matched.filter((x) => x.meta.breadcrumb);
    const oldMatched = oldValue.matched?.filter((x) => x.meta.breadcrumb).map((x) => toRaw(x));

    // const fullPath = route.fullPath;
    // const path = route.path;
    // const name = route.name;
    // const params = route.params;
    // const query = route.query;
    // const hash = route.hash;
    // const matched = route.matched;

    // Fresh entry, just add
    if (!oldMatched) {
      routes.value.push(value);
    }
    // Check for path divergence
    else {
      if (matched.length > oldMatched.length) {
        for (let i = 0; i < oldMatched.length; ++i) {
          if (matched[i].path !== oldMatched[i].path) {
            routes.value = routes.value.slice(0, i);
            break;
          }
        }
        routes.value.push(value);
      } else if (matched.length === oldMatched.length) {
        routes.value[routes.value.length - 1] = value;
      } else if (matched.length < oldMatched.length) {
        for (let i = 0; i < matched.length; ++i) {
          if (matched[i].path !== oldMatched[i].path || i === matched.length - 1) {
            routes.value = routes.value.slice(0, Math.min(0, i - 1));
            break;
          }
        }
        routes.value.push(value);
      }
    }

    oldWatch.value = value;
  },
  { deep: true }
);
</script>

<template>
  <Breadcrumb
    v-if="!route.meta.hideBreadcrumb"
    :model="routes"
  >
    <template #separator>/</template>
    <template #item="{ item }">
      <!-- TODO: Dont link last item, just plain text -->
      <router-link
        :to="{
          name: item.name,
          params: item.params,
          query: item.query,
          hash: item.hash
        }"
      >
        <span
          class="app-primary-color cursor-pointer hover-underline"
          :class="[item.class]"
        >
          {{ item?.meta?.breadcrumb }}
        </span>
      </router-link>
    </template>
  </Breadcrumb>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.p-breadcrumb {
  border: none;
  padding: 0.125rem;
}
</style>
