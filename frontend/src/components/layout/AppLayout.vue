<script setup lang="ts">
import { DevelopmentRoleOverride, Header, Footer } from '@/components/layout';
import { useAuthStore, usePermissionStore } from '@/store';
import { NavigationPermission } from '@/store/permissionStore';

// Store
const authStore = useAuthStore();
const permissionStore = usePermissionStore();
</script>

<template>
  <div class="flex flex-column h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
      <DevelopmentRoleOverride
        v-if="
          authStore.getIsAuthenticated &&
          permissionStore.canNavigate(NavigationPermission.DEVELOPER, false) &&
          permissionStore.getGroupOverride
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
