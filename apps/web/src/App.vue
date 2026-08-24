<template>
  <v-app>
    <v-main>
        <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import "./assets/css/font.css";
import { useCourseStore } from "@/store";

export default {
  name: "App",

  created() {
    const courseStore = useCourseStore();
    courseStore.initCourseData();
  },
};
</script>

<style>

html{
  overflow: overlay!important;
  overflow-x:hidden!important;
}


#app {
  font-family: 'Vazir', sans-serif;
}

.v-chip .v-chip__content {
  white-space: pre-wrap;
  text-align: right;
}
.v-chip.v-size--default {
  min-height: 32px; 
  height: auto !important;
}
.v-data-table > .v-data-table__wrapper .v-data-table__mobile-row {
  min-height: 35px!important;
}

tr.v-data-table__mobile-table-row{
  display: block!important;

}
.v-data-table__mobile-row:nth-child(6n-5){
  display: inline-grid;
  float: left;
  background: none!important;
}
.v-data-table__mobile-row:nth-child(6n-4){
  display: inline-grid;
}

.v-data-table__mobile-row:last-child{
  padding-bottom: 1.5rem!important;
}
.v-list-item .v-list-item__title, .v-list-item .v-list-item__subtitle {
  line-height: 1.1;
  font-size:small;
  font-family: 'Vazir', sans-serif;
}
.v-tab {
  min-width: 40px!important;
  letter-spacing:0rem!important;
}
.v-slide-group__prev{
  display: none !important;
}
.v-slide-group__next{
  display: none !important;
}
.v-application .pl-1 {
  white-space: pre-wrap;
}
.v-btn {
  letter-spacing: 0!important;
}
::-webkit-scrollbar {
  width: 9px;
}

::-webkit-scrollbar-track {
  background: #e6e6e600;
}

::-webkit-scrollbar-thumb {
  background: #b0b0b099;
  border-radius: 0px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0dd;
  transition: background .5s;
}
.row {
  margin: 0px!important;
}
@media screen and (max-width: 768px) {
  ::-webkit-scrollbar {
    width: 0px;
  }
}

</style>
