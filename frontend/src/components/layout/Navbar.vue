<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { Toolbar } from '@/lib/primevue';
import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';

const { getIsAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <nav class="navigation-main pl-2 lg:pl-6">
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <li>
            <router-link :to="{ name: RouteNames.HOME }">Home</router-link>
          </li>
          <li v-if="getIsAuthenticated">
            <router-link :to="{ name: RouteNames.INITIATIVES }">Initiatives</router-link>
          </li>
        </ol>
      </template>
    </Toolbar>
  </nav>
</template>

<style lang="scss" scoped>
.navigation-main {
  background-color: #38598a;
  color: #fcba19;
  display: flex;
  width: 100%;
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;
  .p-toolbar {
    background-color: #38598a !important;
    border: none;
    padding: 0;
    ol {
      display: flex;
      flex-direction: row;
      margin: 0;
      color: #ffffff;
      list-style: none;
      li {
        margin-right: 1em;
        a {
          display: flex;
          font-weight: normal;
          min-height: 2rem;
          color: #ffffff;
          padding: 0.5rem 0.8rem 0.7rem 0.8rem;
          text-decoration: none;

          &:focus {
            outline: none;
            outline-offset: 0;
          }
          &:hover {
            text-decoration: underline;
          }
        }
        & ~ li {
          margin-left: -0.6rem;
        }
      }
      .router-link-exact-active {
        background-color: #7ba2cc80;
        border-bottom: 2px solid #fcba19;
        font-weight: bold;
      }
    }
  }
}
</style>
