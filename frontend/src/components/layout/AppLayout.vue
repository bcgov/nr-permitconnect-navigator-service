<script setup lang="ts">
import { DevelopmentRoleOverride, Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store';
import { ACCESS_ROLES } from '@/utils/enums';

// Store
const authStore = useAuthStore();
</script>

<template>
  <div class="flex flex-column h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
      <DevelopmentRoleOverride
        v-if="authStore.getIsAuthenticated && authStore.userIsRole([ACCESS_ROLES.PCNS_DEVELOPER], false)"
      />
      <Header />
      <slot name="nav" />
    </div>

    <!-- Main views -->
    <main class="m-3 lg:mx-8 flex-auto">
      <slot name="main" />
    </main>

    <!-- Footer -->
    <footer class="flex-shrink-0">
      <Footer />
    </footer>
  </div>
</template>
