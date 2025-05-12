<script setup lang="ts">
import { DevelopmentRoleOverride, Header, Footer } from '@/components/layout';
import { useAuthNStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Store
const authnStore = useAuthNStore();
const authzStore = useAuthZStore();
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
      <DevelopmentRoleOverride
        v-if="
          authnStore.getIsAuthenticated &&
          authzStore.canNavigate(NavigationPermission.DEVELOPER, false) &&
          authzStore.getGroupOverride &&
          authzStore.getInitiativeOverride
        "
      />
      <Header />
      <slot name="nav" />
    </div>

    <!-- Main views -->
    <main class="m-4 lg:mx-20 flex-auto">
      <slot name="main" />
    </main>

    <!-- Footer -->
    <footer class="shrink-0">
      <Footer />
    </footer>
  </div>
</template>
