<template>
  <v-dialog :value="value" @input="$emit('input', $event)" width="60rem">
    <v-card>
      <v-card-title class="pa-5 red darken-1 white--text">
        <h2>تداخل دروس</h2>
      </v-card-title>

      <v-card-text class="mt-4">
        <v-list
          v-if="classTimeConflicts && classTimeConflicts.length !== 0"
          class="text-center"
        >
          <h2 class="">تداخل ساعت کلاسی</h2>
          <v-list-item
            v-for="(list, index) in classTimeConflicts"
            :key="'class-' + (list[0].id || index) + '-' + (list[1].id || index)"
          >
            <v-row>
              <v-col cols="6" class="mt-12">
                <span style="font-weight: bold;">{{ list[0].title }}</span>
                <br />
                <span>{{
                  (list[0].time_room || "").split(/\(.*?\)/).join("")
                }}</span>
                <br />
                <span>{{ list[0].teacher }}</span>
              </v-col>
              <v-col cols="6" class="mt-12">
                <span style="font-weight: bold;">{{ list[1].title }}</span>
                <br />
                <span>{{
                  (list[1].time_room || "").split(/\(.*?\)/).join("")
                }}</span>
                <br />
                <span>{{ list[1].teacher }}</span>
              </v-col>
              <hr />
            </v-row>
          </v-list-item>
        </v-list>

        <v-list
          v-if="finalExamConflicts && finalExamConflicts.length !== 0"
          class="text-center"
        >
          <v-divider
            v-if="classTimeConflicts && classTimeConflicts.length !== 0"
          ></v-divider>
          <h2 class="mt-8">تداخل ساعت امتحان نهایی</h2>
          <v-list-item
            v-for="(list, index) in finalExamConflicts"
            :key="'final-' + (list[0].id || index) + '-' + (list[1].id || index)"
          >
            <v-row>
              <v-col cols="6" class="mt-12">
                <span style="font-weight: bold;">{{ list[0].title }}</span>
                <br />
                <span>{{ list[0].final_date }}</span>
                <br />
                <span>{{ list[0].final_time }}</span>
                <br />
                <span>{{ list[0].teacher }}</span>
              </v-col>
              <v-col cols="6" class="mt-12">
                <span style="font-weight: bold;">{{ list[1].title }}</span>
                <br />
                <span>{{ list[1].final_date }}</span>
                <br />
                <span>{{ list[1].final_time }}</span>
                <br />
                <span>{{ list[1].teacher }}</span>
              </v-col>
              <hr />
            </v-row>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="$emit('input', false)">
          بستن
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ClashAlertModal",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    classTimeConflicts: {
      type: Array,
      default: () => [],
    },
    finalExamConflicts: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
