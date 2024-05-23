<script setup lang="ts">
import { Header, Footer } from '@/components/layout';
</script>

<template>
  <div class="flex flex-column h-screen">
    <!-- Header/Nav -->
    <div class="layout-head">
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
