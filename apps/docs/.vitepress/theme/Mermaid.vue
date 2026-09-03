<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import mermaid from 'mermaid'

const props = defineProps<{
  graph: string
}>()

const { isDark, lang } = useData()
const viewport = ref<HTMLElement | null>(null)
const diagramContent = ref<HTMLElement | null>(null)

const zoomLevel = ref<number>(1)
const initialFitZoom = ref<number>(1)
const translateX = ref<number>(0)
const translateY = ref<number>(0)
const isDragging = ref<boolean>(false)
const isFullscreen = ref<boolean>(false)

let startX = 0
let startY = 0

async function renderDiagram() {
  if (!diagramContent.value) return

  const currentTheme = isDark.value ? 'dark' : 'default'
  mermaid.initialize({
    startOnLoad: false,
    theme: currentTheme,
    fontFamily: lang.value === 'en-US' ? 'Inter, sans-serif' : 'Vazirmatn FD, sans-serif',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
    }
  })

  const uniqueId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  try {
    const { svg } = await mermaid.render(uniqueId, props.graph)
    if (diagramContent.value) {
      diagramContent.value.innerHTML = svg
      await nextTick()
      autoFitDiagram()
    }
  } catch (err) {
    console.error('Mermaid render error:', err)
    if (diagramContent.value) {
      diagramContent.value.innerHTML = `<pre class="mermaid-error">${props.graph}</pre>`
    }
  }
}

/**
 * Calculates the optimal initial zoom so the entire diagram fits nicely
 * inside the card without overflowing or looking excessively large.
 */
function autoFitDiagram() {
  if (!viewport.value || !diagramContent.value) return

  const svgEl = diagramContent.value.querySelector('svg')
  if (!svgEl) return

  const vpWidth = viewport.value.clientWidth - 48
  const vpHeight = (isFullscreen.value ? window.innerHeight : 420) - 80

  const bbox = svgEl.getBoundingClientRect()
  const svgWidth = bbox.width || svgEl.viewBox?.baseVal?.width || 800
  const svgHeight = bbox.height || svgEl.viewBox?.baseVal?.height || 500

  // Calculate scale factor to fit
  const scaleX = vpWidth / svgWidth
  const scaleY = vpHeight / svgHeight
  let fitScale = Math.min(scaleX, scaleY, 1)

  // Avoid shrinking too tiny or zooming too big
  fitScale = Math.max(Math.min(+fitScale.toFixed(2), 1), 0.5)

  initialFitZoom.value = fitScale
  zoomLevel.value = fitScale
  translateX.value = 0
  translateY.value = 0

  updateTransform()
}

function updateTransform() {
  if (!diagramContent.value) return
  diagramContent.value.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${zoomLevel.value})`
}

function zoomIn() {
  if (zoomLevel.value < 3.0) {
    zoomLevel.value = +(zoomLevel.value + 0.2).toFixed(2)
    updateTransform()
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.3) {
    zoomLevel.value = +(zoomLevel.value - 0.2).toFixed(2)
    updateTransform()
  }
}

function resetTransform() {
  zoomLevel.value = initialFitZoom.value
  translateX.value = 0
  translateY.value = 0
  if (diagramContent.value) {
    diagramContent.value.style.transition = 'transform 0.25s ease'
    updateTransform()
    setTimeout(() => {
      if (diagramContent.value) diagramContent.value.style.transition = 'none'
    }, 250)
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    autoFitDiagram()
  }, 100)
}

// Drag & Pan handlers
function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  isDragging.value = true
  startX = e.clientX - translateX.value
  startY = e.clientY - translateY.value
  if (diagramContent.value) {
    diagramContent.value.style.transition = 'none'
  }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  translateX.value = e.clientX - startX
  translateY.value = e.clientY - startY
  updateTransform()
}

function onMouseUp() {
  isDragging.value = false
}

// Wheel zoom
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(Math.max(+(zoomLevel.value + delta).toFixed(2), 0.3), 3.0)
  zoomLevel.value = newZoom
  updateTransform()
}

onMounted(() => {
  renderDiagram()
})

watch(isDark, () => {
  renderDiagram()
})

watch(lang, () => {
  renderDiagram()
})
</script>

<template>
  <div class="mermaid-card" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- Interactive Control Toolbar -->
    <div class="mermaid-toolbar">
      <div class="toolbar-pill">
        <button
          type="button"
          class="tool-btn"
          @click="zoomIn"
          :title="lang === 'en-US' ? 'Zoom In' : 'بزرگ‌نمایی (Zoom In)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>

        <span class="zoom-indicator">{{ Math.round(zoomLevel * 100) }}%</span>

        <button
          type="button"
          class="tool-btn"
          @click="zoomOut"
          :title="lang === 'en-US' ? 'Zoom Out' : 'کوچک‌نمایی (Zoom Out)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>

        <button
          type="button"
          class="tool-btn"
          @click="resetTransform"
          :title="lang === 'en-US' ? 'Fit to Screen' : 'اندازه مناسب و بازنشانی (Fit to Screen)'"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>

        <button
          type="button"
          class="tool-btn"
          @click="toggleFullscreen"
          :title="isFullscreen ? (lang === 'en-US' ? 'Exit Fullscreen' : 'خروج از تمام‌صفحه') : (lang === 'en-US' ? 'Fullscreen' : 'تمام‌صفحه')"
        >
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 2 2h3"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
        </button>
      </div>
      <div class="pan-hint">
        <span>{{ lang === 'en-US' ? '🖱️ Drag & Pan to Move' : '🖱️ جابجایی با کشیدن (Drag & Pan)' }}</span>
      </div>
    </div>

    <!-- Diagram Viewport with Pan & Drag -->
    <div
      class="mermaid-viewport"
      ref="viewport"
      :class="{ 'is-grabbing': isDragging }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel="onWheel"
    >
      <div class="diagram-canvas" ref="diagramContent"></div>
    </div>
  </div>
</template>

<style scoped>
.mermaid-card {
  position: relative;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin: 2rem 0;
  overflow: hidden;
  user-select: none;
  transition: box-shadow 0.25s, border-color 0.25s;
}

.mermaid-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 20px -4px rgba(140, 87, 255, 0.15);
}

.mermaid-card.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  margin: 0;
  border-radius: 0;
  background-color: var(--vp-c-bg);
}

.mermaid-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 3px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.pan-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 4px 10px;
  border-radius: 14px;
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.mermaid-card:hover .pan-hint {
  opacity: 1;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  transform: scale(1.1);
}

.tool-btn:active {
  transform: scale(0.95);
}

.zoom-indicator {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  min-width: 38px;
  text-align: center;
  user-select: none;
  font-weight: 600;
}

.mermaid-viewport {
  width: 100%;
  height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: grab;
  position: relative;
}

.mermaid-card.is-fullscreen .mermaid-viewport {
  height: 100vh;
}

.mermaid-viewport.is-grabbing {
  cursor: grabbing;
}

.diagram-canvas {
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  direction: ltr !important;
}

:deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
  pointer-events: none;
}
</style>
