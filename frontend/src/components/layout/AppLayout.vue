<script setup lang="ts">
import { DevelopmentRoleOverride, Header, Footer } from '@/components/layout';
import { useAuthNStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Store
const authnStore = useAuthNStore();
const authzStore = useAuthZStore();
</script>

<template>
  <div class="flex flex-column h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
      <DevelopmentRoleOverride
        v-if="
          authnStore.getIsAuthenticated &&
          authzStore.canNavigate(NavigationPermission.DEVELOPER, false) &&
          authzStore.getGroupOverride
        "
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
