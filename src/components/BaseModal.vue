<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black opacity-50" @click="onBackdrop"></div>

    <!-- Panel -->
    <div
      class="relative z-10 mx-4 w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'Modal'"
    >
      <!-- Header -->
      <div class="flex items-center gap-2 border-b px-4 py-3 bg-gray-100 rounded-t-xl">
        <slot name="header-left"></slot>
        <h3 class="text-lg font-semibold truncate">{{ title }}</h3>
        <button
          type="button"
          class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200"
          @click="$emit('close')"
          aria-label="Close"
        >×</button>
      </div>

      <!-- Body -->
      <div class="px-4 py-4 bg-gray-100">
        <slot />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 border-t px-4 py-3 bg-gray-50 rounded-b-xl">
        <slot name="footer">
          <button
            type="button"
            class="rounded-lg border px-4 py-2 hover:bg-gray-100"
            @click="$emit('close')"
          >Close</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    closeOnBackdrop: { type: Boolean, default: true },
  },
  methods: {
    onBackdrop() {
      if (this.closeOnBackdrop) this.$emit('close')
    },
  },
}
</script>