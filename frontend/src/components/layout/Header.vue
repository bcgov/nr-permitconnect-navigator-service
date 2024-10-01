<script setup lang="ts">
import { LoginButton } from '@/components/layout';
</script>

<template>
  <header>
    <nav id="header-branding">
      <div class="flex flex-row flex-wrap align-items-center p-2 lg:pl-6">
        <div class="flex flex-none">
          <a href="https://www2.gov.bc.ca">
            <img
              src="@/assets/images/bc_logo.svg"
              width="181"
              height="44"
              alt="B.C. Government Logo"
            />
          </a>
        </div>
        <div class="flex flex-grow-1 ml-2">
          <h2 class="m-0">Permit Connect Services</h2>
        </div>
        <div class="flex flex-none lg:mr-6 ml-2">
          <LoginButton />
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
h2 {
  color: rgba(255, 255, 255, 0.9) !important;
}

#header-branding {
  background-color: #003366;
  color: white;
  white-space: nowrap;
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;

  @media not print {
    border-bottom: 2px solid #fcba19;
  }
}
</style>
