export default {
  props: ['parkingLot', 'hasActiveBooking'], 
  template: `
    <div>
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">{{ parkingLot.location }}</h5>
          <p class="card-text">Total Slots: {{ parkingLot.total_slots }}</p>
          <p class="card-text">Price: ₹{{ parkingLot.price }} per hour</p>
          
          <button
            v-if="$store.state.loggedin && $store.state.roles && $store.state.roles.includes('user')"
            :disabled="userHasActiveBooking"
            type="button"
            class="btn btn-outline-primary"
            @click="showModal"
          >
            Occupy Now
          </button>

          <button v-if="$store.state.loggedin && $store.state.roles && $store.state.roles.includes('admin')" type="button" class="btn btn-outline-secondary" @click="editParkingLot">
            Edit
          </button>
          <button v-if="$store.state.loggedin && $store.state.roles && $store.state.roles.includes('admin')" type="button" class="btn btn-outline-danger" @click="deleteParkingLot">
            Delete
          </button>

        </div>
      </div>

      <!-- Bootstrap Modal -->
      <div class="modal fade" ref="modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header">
              <h5 class="modal-title">Booking Confirmation</h5>
              <button type="button" class="close" @click="hideModal"></button>
            </div>

            <div class="modal-body">
              <p>Please read the terms and conditions before booking.</p>
              <ul>
                <li>Parking is available for hourly rates.</li>
                <li>No refunds after booking.</li>
                <li>Ensure vehicle removal before the end time.</li>
              </ul>
              <p><strong>Estimated Price:</strong> ₹{{ parkingLot.price }}/hour</p>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="hideModal">Cancel</button>
              <button class="btn btn-primary" @click="confirmOccupy">Occupy Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      bsModal: null,
    };
  },
  methods: {
    showModal() {
      const modal = new bootstrap.Modal(this.$refs.modal);
      modal.show();
      this.bsModal = modal;
    },
    hideModal() {
      if (this.bsModal) {
        this.bsModal.hide();
      }
    },
    async confirmOccupy() {
      this.hideModal();
      try {
        const res = await fetch(`${location.origin}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({
            plot_id: this.parkingLot.plot_id,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          this.$store.commit('showToast', {
            message: `Spot occupied successfully! Booking ID: ${data.booking_id}. Spot: ${data.pspot_id}`,
            type: 'success'
          });

          this.$emit('booking-created');  
        } else {
          this.$store.commit('showToast', {
            message: data.message || 'Failed to occupy spot.',
            type: 'danger'
          });
          console.error('Occupation failed:', res.status, data.message || res.statusText);
        }
      } catch (error) {
        this.$store.commit('showToast', {
          message: 'Network error during occupation. Please try again.',
          type: 'danger'
        });
        console.error('Network error during occupation:', error);
      }
    },
      async deleteParkingLot() {
          const res = await fetch(`${location.origin}/api/parking_lot/${this.parkingLot.plot_id}`, {
              method: 'DELETE',
              headers: {
                  'Authentication-Token': this.$store.state.auth_token,
              }
          });
          if (res.ok) {
              this.$store.commit('showToast', { message: 'Parking lot deleted successfully!', type: 'success' });
              this.$emit('parking-lot-deleted', this.parkingLot.plot_id); 
          } else {
              const errorData = await res.json();
              this.$store.commit('showToast', { message: errorData.message || 'Failed to delete parking lot.', type: 'danger' });
              console.error('Delete failed:', res.status, errorData.message || res.statusText);
          }
      },
      async editParkingLot() {
          this.$router.push({ path: `/edit_parking_lot/${this.parkingLot.plot_id}` });
      }
  },
  computed: {
    userHasActiveBooking() {
      return this.$store.state.activeBooking !== null;
    }
  }
};
