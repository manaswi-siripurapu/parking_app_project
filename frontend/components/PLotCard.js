export default {
  props: ['parkingLot'],
  template: `
    <div>
      <!-- Parking Lot Card -->
      <div class="card mb-3">
        <img class="card-img-top" src="https://via.placeholder.com/300x150" alt="Parking Lot">
        <div class="card-body">
          <h5 class="card-title">{{ parkingLot.location }}</h5>
          <p class="card-text">Total Slots: {{ parkingLot.total_slots }}</p>
          <p class="card-text">Price: ₹{{ parkingLot.price }} per hour</p>
          <button type="button" class="btn btn-outline-primary" @click="showModal">
            Book
          </button>
        </div>
      </div>

      <!-- Bootstrap Modal -->
      <div class="modal fade" ref="modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header">
              <h5 class="modal-title">Booking Confirmation</h5>
              <button type="button" class="btn-close" @click="hideModal"></button>
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
    confirmOccupy() {
      // You can replace this with an actual API POST request
      alert(`Parking spot at ${this.parkingLot.location} booked!`);
      this.hideModal();
    },
  },
};
