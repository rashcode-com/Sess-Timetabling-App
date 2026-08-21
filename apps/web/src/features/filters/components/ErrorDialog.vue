<template>
  <v-dialog :value="value" @input="$emit('input', $event)" width="400">
    <div class="white px-4 py-2" fluid>
      <v-card class="my-2 white">
        <div class="red white--text text-center pa-2" style="font-size: 20px">
          <h2>خطا</h2>
        </div>

        <v-list-item
          v-for="error in errorMessages"
          :key="error"
          class="grey lighten-3 pa-2"
        >
          <v-list-item-content>
            {{ error }}
          </v-list-item-content>
        </v-list-item>
      </v-card>

      <div class="text-center">
        <v-btn
          @click="$emit('input', false)"
          class="orange lighten-3"
          style="font-size: 1rem"
        >
          بستن
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
export default {
  name: "ErrorDialog",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
