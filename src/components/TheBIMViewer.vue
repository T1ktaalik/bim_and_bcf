<template>
  <div ref="theViewer" class="h-screen w-screen overflow-hidden relative">
    <!-- Explorer Toggle Button -->
    <input type="checkbox" id="explorer_toggle" class="hidden" v-model="isExplorerVisible" />
    <label
      for="explorer_toggle"
      class="absolute top-4 left-0 z-20 text-white px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-100 shadow-md hover:shadow-lg flex items-center gap-2"
      :class="{ 'left-[358px]': isExplorerVisible }"
    >
      <i class="fas fa-folder text-lg" :class="{ 'text-orange-500': isExplorerVisible, 'text-white': !isExplorerVisible }"></i>
    </label>
    
    <!-- Inspector Toggle Button -->
    <input type="checkbox" id="inspector_toggle" class="hidden" v-model="isInspectorVisible" />
    <label
      for="inspector_toggle"
      class="absolute top-4 right-0 z-20 text-white px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-100 shadow-md hover:shadow-lg flex items-center gap-2"
      :class="{ 'right-[358px]': isInspectorVisible }"
    >
      <i class="fas fa-info-circle text-lg" :class="{ 'text-orange-500': isInspectorVisible, 'text-white': !isInspectorVisible }"></i>
    </label>
    
    <!-- Explorer Panel -->
    <div
      ref="viewerExplorer"
      id="myExplorer"
      class="absolute top-0 left-0 h-full w-[358px] bg-gray-800/90 z-10 overflow-y-auto border-r border-gray-700 shadow-xl transition-all duration-100 ease-in-out backdrop-blur-sm"
      :class="{ 'translate-x-0': isExplorerVisible, '-translate-x-full': !isExplorerVisible }"
    ></div>
    
    <!-- Inspector Panel -->
    <div
      ref="viewerInspector"
      id="myInspector"
      class="absolute top-0 right-0 h-full w-[358px] bg-gray-800/90 z-10 overflow-y-auto border-l border-gray-700 shadow-xl transition-all duration-100 ease-in-out backdrop-blur-sm"
      :class="{ 'translate-x-0': isInspectorVisible, 'translate-x-full': !isInspectorVisible }"
    ></div>
    
    <!-- Toolbar -->
    <div ref="viewerToolbar" id="theViewerToolbar" class="absolute z-4 top-1 left-1/2 transform -translate-x-1/2" :style="{ left: isExplorerVisible ? 'calc(50% + 179px)' : '50%' }"></div>
    
    <!-- Main Canvas -->
    <canvas ref="viewerCanvas" class="absolute h-full w-full z-[2]"></canvas>
    
    <!-- Nav Cube Canvas -->
    <canvas ref="viewerNavCubeCanvas" class="absolute z-3 bottom-4 right-4 h-[180px] w-[180px]"></canvas>
    
    <!-- BCF Controls at the Bottom -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10" :style="{ left: isExplorerVisible ? 'calc(50% + 179px)' : '50%' }">
      <div class="flex flex-wrap items-center gap-1">
        <!-- Save Button -->
        <button
          @click="saveTheBCFViewpoint"
          class="border border-gray-600/50 text-gray-300 rounded-md px-3 py-2 cursor-pointer transition-all duration-200 text-sm flex items-center justify-center min-w-[40px] min-h-[40px] hover:bg-gray-600/90 border-gray-500/70 transform translate-y-[-1px] shadow-md bg-orange-600/90 border-orange-500/80 text-white hover:bg-orange-500/90"
          title="Сохранить вид"
        >
          <i class="fas fa-save mr-2"></i>
          Сохранить вид
        </button>
        
        <!-- Load BCF Dropdown -->
        <div class="relative">
          <button
            @click="toggleBCFDropdown"
            class="border border-gray-600/50 text-gray-300 rounded-md px-3 py-2 cursor-pointer transition-all duration-200 text-sm flex items-center justify-center min-w-[40px] min-h-[40px] hover:bg-gray-600/90 border-gray-500/70 transform translate-y-[-1px] shadow-md"
            :title="`Выберите BCF для загрузки`"
          >
            <span>Выберите BCF...</span>
            <i class="fas fa-chevron-down ml-2 text-xs"></i>
          </button>
          
          <!-- Custom Dropdown Menu -->
          <div
            v-if="isBCFDropdownOpen"
            class="xeokit-context-menu absolute bottom-full mb-2 w-48"
            style="left: 50%; transform: translateX(-50%);"
          >
            <div
              v-for="file in bcfFiles"
              :key="file.name"
              class="xeokit-context-menu-item"
              @click="loadBCFViewpoint(file.name)"
            >
              {{ file.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, reactive, onMounted, onUnmounted } from 'vue'
import { useBIMViewer } from './useBIMViewer'
import { LocaleService } from '../assets/bim-viewer/src/LocaleService.js'
import { messages as localeMessages } from '../assets/bim-viewer/locales/messages.js'

const bcfURL = import.meta.env.VITE_BCF_URL

const theViewer = ref<HTMLElement | null>(null)
const viewerExplorer = ref<HTMLElement | null>(null)
const viewerInspector = ref<HTMLElement | null>(null)
const viewerToolbar = ref<HTMLElement | null>(null)
const viewerCanvas = ref<HTMLCanvasElement | null>(null)
const viewerNavCubeCanvas = ref<HTMLCanvasElement | null>(null)

// Explorer visibility states
const isExplorerVisible = ref(false)
const isInspectorVisible = ref(false)

// Viewer and project loading states
const isViewerInitialized = ref(false)
const isProjectLoaded = ref(false)

// Reactive list of BCF files
const bcfFiles = reactive<{ name: string; label: string }[]>([])

// Reactive state for BCF dropdown
const isBCFDropdownOpen = ref(false)

// Toggle BCF dropdown visibility
function toggleBCFDropdown() {
  isBCFDropdownOpen.value = !isBCFDropdownOpen.value
}

// Configuration objects

const theBimServerConfig = {
  //dataDir: '.' // Adjust this path to where your projects are located
 basePath: import.meta.env.VITE_BASE_URL + '/projects' // Adjust this path to where your projects are located
}

const { initBIMViewer, loadProject, saveBCFViewpoint, loadBCFViewpointFromURL, customizeToolbar } = useBIMViewer()

// Initialize the BIM viewer
const initializeViewer = async () => {
  if (!viewerCanvas.value || !viewerExplorer.value || !viewerInspector.value ||
      !viewerNavCubeCanvas.value || !viewerToolbar.value || !theViewer.value) {
    console.error('One or more viewer elements are not available')
    return
  }

  // Create LocaleService instance
  const localeService = new LocaleService({
    messages: localeMessages,
    locale: 'ru'
  });

  // Configuration for the BIM viewer
  const theBimViewerConfig = {
    //locale: 'ru', // Set to Russian as in the example
    locale: 'ru',
    localeService: localeService,
    canvasElement: viewerCanvas.value,
    explorerElement: viewerExplorer.value,
    inspectorElement: viewerInspector.value,
    navCubeCanvasElement: viewerNavCubeCanvas.value,
    busyModelBackdropElement: theViewer.value,
    toolbarElement: viewerToolbar.value
  }

  // Initialize the viewer without the callback to prevent infinite loop
  const success = await initBIMViewer(theBimServerConfig, theBimViewerConfig)
  
  if (success) {
    console.log('BIM Viewer initialized successfully')
    // Set viewer initialized flag
    isViewerInitialized.value = true
    
    // Load the default project with callbacks
    loadProject(
      'evrodom',
      () => {
        console.log('Project loaded successfully')
        isProjectLoaded.value = true
        // Parse BCF query parameter after both viewer is initialized and project is loaded
        parseBCFQueryParam()
      },
      () => {
        console.log('Project not loaded')
        // Even if project fails to load, we still want to parse the BCF query parameter
        parseBCFQueryParam()
      }
    )
    
    // Customize the toolbar after initialization
    nextTick(() => {
      customizeToolbar()
    })
  }
}

// Function to parse BCF query parameter only when viewer is initialized and project is loaded
const parseBCFQueryParam = () => {
  // Check if both viewer is initialized and project is loaded
  if (isViewerInitialized.value && (isProjectLoaded.value || true)) { // The '|| true' is to handle the case where project loading fails
    // Get the BCF query parameter from URL
    const urlParams = new URLSearchParams(window.location.search)
    const bcfParam = urlParams.get('bcf')
    
    if (bcfParam) {
      console.log('BCF query parameter found:', bcfParam)
      // Load the BCF viewpoint with proper .json extension
     // loadBCFViewpointFromURL(`https://storage.yandexcloud.net/apps.nova-engineering.pro/promo_warehouse/bcf/${bcfParam}.json`)
      loadBCFViewpointFromURL(bcfURL+`/${bcfParam}.json`)
    } else {
      console.log('No BCF query parameter found')
    }
  } else {
    console.log('Viewer not initialized or project not loaded yet')
  }
}

function saveTheBCFViewpoint() {
console.log('Save the BCF viewpoint')
saveBCFViewpoint()
console.log(saveBCFViewpoint())
console.log(saveBCFViewpoint)
}

// Close dropdown when clicking outside
function closeBCFDropdownOnClickOutside(event: MouseEvent) {
  const dropdown = document.querySelector('.relative');
  if (dropdown && !dropdown.contains(event.target as Node)) {
    isBCFDropdownOpen.value = false;
  }
}

// Add event listener for closing dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', closeBCFDropdownOnClickOutside);
})

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', closeBCFDropdownOnClickOutside);
})


function loadBCFViewpoint(fileName: string) {
console.log(`Load the BCF viewpoint: ${fileName}`)
// Close the dropdown
isBCFDropdownOpen.value = false
// For now, we'll just load the BCF viewpoint without updating the URL
// In a full Vue Router implementation, we would use router.push()
// Load the BCF viewpoint from the public directory
loadBCFViewpointFromURL(bcfURL+`/${fileName}`)
}

// Lifecycle hooks
onMounted(async () => {
  // Initialize the viewer when component is mounted
 
  initializeViewer()
  
  // Fetch the list of BCF files from the server
  try {
    console.log(bcfURL+`/index.json`)
    const response = await fetch(bcfURL+`/index.json`)
    const fileNames = await response.json()
    
    // Convert file names to objects with name and label properties
    const bcfFileObjects = fileNames.map((name: string) => ({
      name,
      label: name.replace('.json', '') // Remove .json extension for display
    }))
    
    // Populate the reactive list
    bcfFiles.push(...bcfFileObjects)
  } catch (error) {
    console.error('Error fetching BCF files:', error)
  }
})
</script>