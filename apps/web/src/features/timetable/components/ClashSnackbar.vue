<template>
  <v-snackbar
    :value="value"
    @input="$emit('input', $event)"
    timeout="-1"
    color="red darken-1"
  >
    <span class="white--text">تداخل دروس!</span>
    <template v-slot:action="{ attrs }">
      <v-btn @click="$emit('view-details')" color="white" text>
        جزئیات
      </v-btn>

      <v-btn
        color="white"
        text
        v-bind="attrs"
        @click="$emit('input', false)"
      >
        بستن
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "ClashSnackbar",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
