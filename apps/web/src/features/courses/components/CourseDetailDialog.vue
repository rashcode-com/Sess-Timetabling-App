<template>
  <v-dialog :value="value" @input="$emit('input', $event)" width="500">
    <v-card v-if="course">
      <v-card-title class="grey lighten-2">
        {{ course.title }}
      </v-card-title>

      <v-card-text class="mt-4">
        <v-list>
          <v-list-item>
            <span style="font-weight: bold;">بخش: </span>
            {{ course.unit }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">نام استاد: </span>
            {{ course.teacher }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">گروه: </span>
            {{ course.group }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">واحد: </span>
            {{ course.vahed }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">جنسیت: </span>
            {{ course.gender }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">امتحان نهایی: </span>
            {{
              (course.final_date || "") +
              (course.final_time ? " (" + course.final_time + ")" : "")
            }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">زمان و مکان کلاس: </span>
            {{ course.time_room }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">ظرفیت: </span>
            {{ course.capacity }}
          </v-list-item>

          <v-list-item>
            <span style="font-weight: bold;">ساعت در هفته: </span>
            {{ course.time_in_week }}
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
  name: "CourseDetailDialog",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    course: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
