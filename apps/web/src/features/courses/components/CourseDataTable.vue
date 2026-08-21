<template>
  <div>
    <div id="app-back">
      <v-layout class="d-flex" align-center child-flex>
        <v-data-table
          :headers="headers"
          :items="results"
          class="elevation-1 row-pointer"
          :value="value"
          @input="$emit('input', $event)"
          show-select
          hide-default-footer
          item-key="id"
          show-expand
          :expanded.sync="expanded"
          :page.sync="page"
          :items-per-page="itemsPerPage"
          @page-count="pageCount = $event"
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <div
                class="white rounded-lg"
                :class="mobileDevice ? 'pa-1 mt-2 mb-2' : 'pa-3 ma-4'"
              >
                <v-row>
                  <h2>
                    {{ item["title"] }} | {{ item["vahed"] }} واحد
                  </h2>
                </v-row>

                <div class="body-font mt-8">
                  <v-row>
                    <v-col class="screen-expanded">
                      <span class="title-font-weight">نام استاد : </span>
                      <span>{{ item["teacher"] }}</span>
                    </v-col>
                    <v-col class="screen-expanded">
                      <span class="title-font-weight">نام بخش : </span>
                      <span>{{ item["unit"] }}</span>
                    </v-col>

                    <v-col class="screen-expanded">
                      <span class="title-font-weight">تاریخ امتحان : </span>
                      <span>{{ item["final_date"] }}</span>
                    </v-col>
                    <v-col class="screen-expanded">
                      <span class="title-font-weight">ساعت امتحان : </span>
                      <span>{{ item["final_time"] }}</span>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col class="screen-expanded">
                      <span class="title-font-weight">شماره گروه : </span>
                      <span>{{ item["group"] }}</span>
                    </v-col>

                    <v-col class="screen-expanded">
                      <span class="title-font-weight">واحد : </span>
                      <span>{{ item["vahed"] }}</span>
                    </v-col>

                    <v-col class="screen-expanded">
                      <span class="title-font-weight">جنسیت : </span>
                      <span>{{ item["gender"] }}</span>
                    </v-col>

                    <v-col class="screen-expanded">
                      <span class="title-font-weight">زمان و مکان کلاس : </span>
                      <span>{{ item["time_room"] }}</span>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </td>
          </template>
        </v-data-table>
      </v-layout>
    </div>

    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount"></v-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseDataTable",
  props: {
    results: {
      type: Array,
      required: true,
    },
    value: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [
        { text: "درس", value: "title" },
        { text: "استاد", value: "teacher" },
        { text: "گروه", value: "group" },
        { text: "زمان و مکان کلاس", value: "time_room" },
      ],
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    mobileDevice: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      expanded: [],
      page: 1,
      pageCount: 0,
    };
  },
};
</script>

<style scoped>
#app-back {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: row;
}

.mobile-expanded {
  font-size: small;
}

.screen-expanded {
  font-size: medium;
}

.title-font-weight {
  font-weight: bold;
}
</style>
