<template>
  <div class="flex justify-center mt-6 gap-2">
    <button
      type="button"
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="currentPage <= 1"
      @click="goPrev"
    >
      Prev
    </button>

    <button
      v-for="n in pages"
      :key="n"
      type="button"
      class="px-3 py-1 border rounded"
      :class="n === currentPage ? 'bg-pink-500 text-white' : ''"
      @click="setPage(n)"
    >
      {{ n }}
    </button>

    <button
      type="button"
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="currentPage >= totalPages"
      @click="goNext"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    totalPages: { type: Number, required: true },
    currentPage: { type: Number, required: true },
  },
  computed: {
    pages() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1)
    },
  },
  methods: {
    setPage(n) {
      if (n < 1 || n > this.totalPages) return
      this.$emit('change', n)
    },
    goPrev() { this.setPage(this.currentPage - 1) },
    goNext() { this.setPage(this.currentPage + 1) },
  },
}
</script>
