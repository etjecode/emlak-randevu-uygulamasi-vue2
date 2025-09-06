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
      v-if="totalPages > 1"
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
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
    }
  },
  computed: {
    hasItems() {
      return Array.isArray(this.appointments) && this.appointments.length > 0
    },
    totalPages() {
      return Math.ceil((this.appointments?.length || 0) / this.itemsPerPage)
    },
    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return (this.appointments || []).slice(start, end)
    },
  },
  methods: {
    changePage(page) {
      this.currentPage = page
    },
  },
}
</script>
