<template>
  <div v-if="selectedList && selectedList.length">
    <div class="text-center">
      <v-badge
        v-if="interferenceCount > 0"
        :content="interferenceCount"
        :value="interferenceCount"
        color="red"
        left
        overlap
        class="my-2 text-center"
      >
        <v-btn
          color="white"
          class="pa-4"
          elevation="0"
          small
          fab
          dark
          @click="$emit('open-clash-modal')"
        >
          <v-icon large color="red">
            mdi-alert
          </v-icon>
        </v-btn>
      </v-badge>

      <p>مجموع واحدها: {{ vahedsSum }}</p>
    </div>

    <div
      v-for="item in selectedList"
      :key="item.id || item.index"
      class="class-list-card"
    >
      <div class="class-item-name-box">
        <div>
          <label class="group-name"> {{ item.title }} </label>
        </div>
        <label class="proff-name"> {{ item.teacher }} </label>
      </div>
      <div>
        <v-btn icon @click="$emit('show-details', item)">
          <v-icon>mdi-information</v-icon>
        </v-btn>
        <v-btn icon @click="$emit('remove-course', item.id)">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectedCoursesTab",
  props: {
    selectedList: {
      type: Array,
      default: () => [],
    },
    interferenceCount: {
      type: Number,
      default: 0,
    },
    vahedsSum: {
      type: [String, Number],
      default: "۰",
    },
  },
};
</script>

<style scoped>
.class-list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  min-width: 247px;
  width: 300px;
  padding: 7px;
  margin-top: 5px;
  margin: 7px auto;
  background-color: #c0dbe4;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 3px 3px 6px #d9d9d9, -3px -3px 6px #ffffff;
}
</style>
