<template>
  <div>
    <div v-if="!hasItems" class="text-gray-500 text-center py-8">
      No appointments found.
    </div>

    <div v-else class="space-y-3">
      <AppointmentCard
        v-for="(ap, idx) in paginatedAppointments"
        :key="ap.id"
        :ap="ap"
        :index="(currentPage - 1) * itemsPerPage + idx"
        @edit="$emit('edit', ap)"
      />
    </div>

    <Pagination
      v-if="hasItems && totalPages > 1"
      :totalPages="totalPages"
      :currentPage="currentPage"
      @change="changePage"
    />
  </div>
</template>

<script>
import AppointmentCard from '@/components/AppointmentCard.vue'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'AppointmentList',
  components: { AppointmentCard, Pagination },
  props: {
    appointments: { type: Array, default: () => [] },
    itemsPerPage: { type: Number, default: 10 },
  },
  data() {
    return {
      currentPage: 1,
    }
  },
  computed: {
    hasItems() {
      return Array.isArray(this.appointments) && this.appointments.length > 0
    },
    totalPages() {
      const len = this.hasItems ? this.appointments.length : 0
      return Math.max(1, Math.ceil(len / this.itemsPerPage))
    },
    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return (this.appointments || []).slice(start, end)
    },
  },
  watch: {
    appointments() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
      if (!this.hasItems) this.currentPage = 1
    },
    itemsPerPage() {
      this.currentPage = 1
    },
  },
  methods: {
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.$emit('page-change', page)
    },
  },
}
</script>
