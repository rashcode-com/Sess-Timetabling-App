<template>
  <v-snackbar
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    color="error"
    location="bottom start"
    rounded="lg"
    elevation="6"
    :timeout="8000"
    class="clash-snackbar mb-6 mr-4"
  >
    <div class="d-flex align-center gap-2">
      <v-avatar color="white" size="28" class="ml-2 flex-shrink-0">
        <v-icon color="error" size="18">mdi-alert-circle</v-icon>
      </v-avatar>
      <div>
        <div class="font-weight-bold text-subtitle-2">تداخل در برنامه درسی یا امتحانات!</div>
        <div class="text-caption text-white opacity-90">برخی از دروس انتخابی دارای هم‌پوشانی زمانی هستند.</div>
      </div>
    </div>

    <template #actions>
      <v-btn
        variant="tonal"
        color="white"
        size="small"
        class="font-weight-bold ml-2 clash-details-btn"
        @click="$emit('view-details')"
      >
        بررسی تداخل‌ها
      </v-btn>
      <v-btn
        icon
        variant="text"
        color="white"
        size="small"
        @click="$emit('update:modelValue', false)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
}

const {
  modelValue = false,
} = defineProps<Props>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "view-details"): void;
}>();
</script>

<style scoped>
.clash-snackbar {
  z-index: 2000 !important;
}

.clash-details-btn {
  letter-spacing: normal !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
