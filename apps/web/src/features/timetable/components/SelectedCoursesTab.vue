<template>
  <div v-if="selectedList && selectedList.length" class="selected-courses-container">
    <!-- 1. Total Units Summary Banner -->
    <v-card class="units-summary-card mb-3 pa-3" rounded="lg" elevation="1">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="32" class="ml-2">
            <v-icon color="primary" size="18">mdi-school-outline</v-icon>
          </v-avatar>
          <span class="font-weight-bold text-subtitle-2">مجموع واحدهای انتخابی</span>
        </div>
        <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
          {{ vahedsSum }} واحد
        </v-chip>
      </div>
    </v-card>

    <!-- Conflict Alert Banner -->
    <v-expand-transition>
      <v-card
        v-if="interferenceCount > 0"
        class="clash-alert-banner mb-3 pa-3"
        rounded="lg"
      >
        <!-- Balanced Top Row: Icon + Title -->
        <div class="d-flex align-center mb-1">
          <v-avatar color="error" variant="flat" size="26" class="ml-2 flex-shrink-0">
            <v-icon color="white" size="15">mdi-alert</v-icon>
          </v-avatar>
          <h4 class="text-subtitle-2 font-weight-bold text-error mb-0">
            تداخل در برنامه دروس!
          </h4>
        </div>

        <!-- Description -->
        <p class="text-caption text-medium-emphasis mb-3 pr-1">
          {{ toFarsiNumber(interferenceCount) }} مورد تداخل کلاسی یا امتحانی شناسایی شده است.
        </p>

        <!-- Perfectly Centered CTA Button -->
        <v-btn
          block
          size="small"
          color="error"
          variant="flat"
          class="font-weight-bold clash-cta-btn"
          rounded="sm"
          @click="$emit('open-clash-modal')"
        >
          <div class="d-flex align-center justify-center w-100">
            <v-icon size="16" class="ml-1">mdi-eye-outline</v-icon>
            <span>مشاهده و بررسی تداخل‌ها</span>
          </div>
        </v-btn>
      </v-card>
    </v-expand-transition>

    <!-- Symmetrical Course Cards -->
    <div class="courses-card-list d-flex flex-column gap-2">
      <v-card
        v-for="item in selectedList"
        :key="item.id"
        class="course-item-card pa-3"
        rounded="lg"
        elevation="1"
      >
        <!-- Top Row: Course Title & Units Chip -->
        <div class="d-flex align-center justify-space-between mb-1">
          <h4 class="course-title mb-0" :title="item.title">{{ item.title }}</h4>
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold flex-shrink-0 mr-1">
            {{ toFarsiNumber(item.vahed) }} واحد
          </v-chip>
        </div>

        <!-- Instructor & Group Row -->
        <div class="d-flex align-center text-caption text-medium-emphasis mb-2">
          <v-icon size="14" class="ml-1" color="secondary">mdi-account-tie-outline</v-icon>
          <span class="text-truncate">{{ item.teacher }}</span>
          <span class="mx-1">•</span>
          <span>گروه {{ toFarsiNumber(item.group) }}</span>
        </div>

        <v-divider class="mb-2"></v-divider>

        <!-- Symmetrical Action Row -->
        <div class="d-flex align-center justify-space-between">
          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            class="px-2"
            @click="$emit('show-details', item)"
          >
            <v-icon start size="14">mdi-information-outline</v-icon>
            مشخصات
          </v-btn>

          <v-btn
            size="x-small"
            variant="text"
            color="error"
            class="px-2"
            @click="$emit('remove-course', item.id)"
          >
            <v-icon start size="14">mdi-trash-can-outline</v-icon>
            حذف از برنامه
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-10 px-4">
    <v-avatar color="primary" variant="tonal" size="56" class="mb-3">
      <v-icon size="32" color="primary">mdi-calendar-check-outline</v-icon>
    </v-avatar>
    <h4 class="text-subtitle-2 font-weight-bold mb-1">دروسی انتخاب نشده است</h4>
    <p class="text-caption text-medium-emphasis mb-0">
      برای افزودن درس به برنامه، در جدول نتایج چک‌باکس دروس مورد نظر را انتخاب کنید.
    </p>
  </div>
</template>

<script setup lang="ts">
import { toFarsiNumber } from "@sess/core";
import type { Course } from "@/types";

interface Props {
  selectedList?: Course[];
  interferenceCount?: number;
  vahedsSum?: string | number;
}

const {
  selectedList = [],
  interferenceCount = 0,
  vahedsSum = "۰",
} = defineProps<Props>();

defineEmits<{
  (e: "show-details", course: Course): void;
  (e: "remove-course", courseId: string): void;
  (e: "open-clash-modal"): void;
}>();
</script>

<style scoped>
.selected-courses-container {
  width: 100%;
}

.units-summary-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.clash-alert-banner {
  background-color: rgba(var(--v-theme-error), 0.08);
  border: 1px solid rgba(var(--v-theme-error), 0.25);
}

.clash-cta-btn {
  letter-spacing: normal !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
}

.clash-cta-btn :deep(.v-btn__content) {
  justify-content: center !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
}

.course-item-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-right: 4px solid rgb(var(--v-theme-primary)) !important;
  box-shadow: var(--shadow-xs) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-item-card:hover {
  transform: translateX(-2px);
  box-shadow: var(--shadow-sm) !important;
}

.course-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
