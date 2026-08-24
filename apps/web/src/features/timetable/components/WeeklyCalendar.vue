<template>
  <div v-if="selectedList.length" class="calenderShower light-blue darken-2">
    <v-icon
      large
      @click="toggleCalendar"
      color="white"
      :class="calenderOpen ? 'calnderCloseIcon' : ''"
    >
      mdi-chevron-down
    </v-icon>
    <span style="margin:auto 1rem auto 2rem" class="white--text">نمایش تقویم</span>
    <div class="calenderHolder">
      <div class="theCalender" dir="ltr">
        <v-sheet
          v-if="calenderOpen"
          :height="mobileDevice ? 400 : 600"
          class="ma-2 rounded-lg"
        >
          <v-calendar
            ref="calendar"
            v-model="calendarValue"
            :weekdays="weekday"
            :type="type"
            :events="events"
            :first-interval="6"
            :interval-count="16"
            :event-overlap-mode="mode"
            :event-overlap-threshold="30"
            :event-color="getEventColor"
            @click:event="showEvent"
          ></v-calendar>
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card color="grey lighten-4" min-width="290px" flat>
              <v-toolbar :color="selectedEvent.color" dark>
                <v-toolbar-title>{{ selectedEvent.name }}</v-toolbar-title>
              </v-toolbar>
              <v-list style="background:none">
                <v-list-item>
                  <span style="font-weight: bold;">نام استاد: </span>
                  {{ selectedEvent.teacher }}
                </v-list-item>

                <v-list-item>
                  <span style="font-weight: bold;">گروه: </span>
                  {{ selectedEvent.group }}
                </v-list-item>

                <v-list-item>
                  <span style="font-weight: bold;">امتحان نهایی: </span>
                  {{
                    (selectedEvent.final_date || "") +
                      (selectedEvent.final_time ? " (" + selectedEvent.final_time + ")" : "")
                  }}
                </v-list-item>
              </v-list>
              <v-card-actions style="flex-direction: row-reverse;">
                <v-btn text color="primary" @click="selectedOpen = false">
                  بستن
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WeeklyCalendar",
  props: {
    selectedList: {
      type: Array,
      default: () => [],
    },
    mobileDevice: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      calenderOpen: false,
      type: "week",
      mode: "stack",
      weekday: [6, 0, 1, 2, 3, 4, 5],
      calendarValue: "",
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: [
        "#222831",
        "#00ADB5",
        "#F08A5D",
        "#B83B5E",
        "#6A2C70",
        "#903749",
        "#3282B8",
        "#00ADB5",
        "#FF5722",
        "#086972",
        "#17B978",
      ],
    };
  },
  watch: {
    selectedList: {
      immediate: true,
      handler(newList) {
        this.computeEvents(newList || []);
      },
    },
  },
  methods: {
    computeEvents(courses) {
      const convertDayName = [
        "یکشنبه",
        "دوشنبه",
        "سهشنبه",
        "چهارشنبه",
        "پنجشنبه",
        "جمعه",
        "شنبه",
      ];

      const events = [];
      const today = new Date();
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        if (!course.seperated_time_and_place) continue;
        for (
          let j = 0;
          j < course.seperated_time_and_place.length;
          j++
        ) {
          const slot = course.seperated_time_and_place[j];
          let differenceToToDay =
            convertDayName.indexOf(slot.day) - today.getDay();
          if (today.getDay() === 6) {
            differenceToToDay =
              differenceToToDay < 0 ? differenceToToDay + 7 : differenceToToDay;
          } else {
            differenceToToDay =
              differenceToToDay < -today.getDay() - 1
                ? differenceToToDay + 5 - today.getDay()
                : differenceToToDay > 5 - today.getDay()
                ? differenceToToDay - 7
                : differenceToToDay;
          }

          let thisDateStart = new Date();
          let thisDateEnd = new Date();
          thisDateStart.setDate(today.getDate() + differenceToToDay);
          thisDateStart.setHours(slot.startHour);
          thisDateStart.setMinutes(slot.startMinute);
          thisDateStart.setSeconds(0);
          thisDateEnd.setDate(today.getDate() + differenceToToDay);
          thisDateEnd.setHours(slot.endHour);
          thisDateEnd.setMinutes(slot.endMinute);
          thisDateEnd.setSeconds(0);
          events.push({
            name: course.title,
            start: thisDateStart,
            end: thisDateEnd,
            color: this.colors[i % this.colors.length],
            timed: 1,
            teacher: course.teacher,
            group: course.group,
            final_time: course.final_time,
            final_date: course.final_date,
          });
        }
      }
      this.events = events;
    },
    toggleCalendar() {
      this.calenderOpen = !this.calenderOpen;
    },
    getEventColor(event) {
      return event.color;
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
  },
};
</script>

<style scoped>
.calenderShower {
  width: 100%;
  background: #ddd5;
  padding: 1rem 1rem;
  border-radius: 0.4rem;
}

@media screen and (max-width: 768px) {
  .calenderShower {
    overflow-x: scroll;
  }
  .theCalender {
    min-width: 600px;
  }
}

.calnderCloseIcon {
  transform: rotate(-180deg);
}
</style>
