<script setup lang="ts">
import { DevelopmentRoleOverride, Header, Footer } from '@/components/layout';
import { PermissionService } from '@/services';
import { Permissions } from '@/services/permissionService';
import { useAuthStore } from '@/store';

// Store
const authStore = useAuthStore();

const permissionService = new PermissionService();
</script>

<template>
  <div class="flex flex-column h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
      <DevelopmentRoleOverride
        v-if="
          authStore.getIsAuthenticated &&
          permissionService.can(Permissions.TESTING_ROLE_OVERRIDE, false) &&
          permissionService.getRoleOverride()
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
