<template>
  <v-locale-provider rtl>
    <v-app class="app-root">
      <v-main class="app-main">
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useCourseStore } from "@/store";

const courseStore = useCourseStore();

onBeforeMount(() => {
  courseStore.initCourseData();
});
</script>

<style>
.app-root {
  background-color: var(--color-bg) !important;
  font-family: var(--font-family-base) !important;
  min-height: 100vh;
}

.app-main {
  background-color: var(--color-bg) !important;
}

/* RTL Helpers */
[dir="rtl"] .v-application {
  font-family: var(--font-family-base) !important;
}
</style>
