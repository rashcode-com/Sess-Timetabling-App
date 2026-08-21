<template>
  <div fluid>
    <v-layout row wrap align-center class="d-none d-lg-flex d-xl-none">
      <v-flex align-self="center" class="text-center white--text ma-2" lg4>
        <h3 class="font-weight-bold">{{ updateTimeDateText }}</h3>
        <h4 class="font-weight-bold">{{ updateTimeClockText }}</h4>
      </v-flex>

      <v-flex align-self="center" lg4 class="ma-2 text-center">
        <h1 class="white--text">برنامه کلاسی نیمسال</h1>
        <h3 class="orange--text">دانشگاه شیراز</h3>
      </v-flex>

      <v-flex align-self="center" class="text-center ma-2">
        <h3 class="font-weight-bold white--text">{{ version }}</h3>
      </v-flex>
    </v-layout>

    <!-- Another layout -->
    <v-layout row wrap align-center class="d-lg-none d-xl-flex">
      <v-flex align-self="center" xs12 class="ma-1 text-center">
        <h1 class="white--text">برنامه کلاسی نیمسال</h1>
        <h3 class="orange--text">دانشگاه شیراز</h3>
      </v-flex>

      <v-flex align-self="center" class="text-center white--text mt-6" xs12>
        <h4 class="font-weight-bold">{{ updateTimeDateText }}</h4>
        <h4 class="font-weight-bold">{{ updateTimeClockText }}</h4>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: "AppHeader",
  props: {
    updateTimeDateText: {
      type: String,
      default: "به روز شده در ۹ شهریور",
    },
    updateTimeClockText: {
      type: String,
      default: "ساعت ۱۱:۱۸",
    },
    version: {
      type: String,
      default: "نسخه 0.1.5",
    },
  },
};
</script>
