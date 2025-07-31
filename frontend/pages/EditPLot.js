export default {
    name: 'EditParkingLot',
    template: `
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card shadow-lg p-4 p-md-5" style="max-width: 500px; width: 100%;">
                <h2 class="card-title text-center mb-4">Edit Parking Lot</h2>
                
                <form @submit.prevent="submitForm">
                    <div class="form-group mb-3">
                        <label for="location">Location</label>
                        <input type="text" class="form-control" id="location" v-model="location" disabled>
                        <small class="form-text text-muted">Location cannot be changed.</small>
                    </div>
                    <div class="form-group mb-3">
                        <label for="address">Address</label>
                        <input type="text" class="form-control" id="address" v-model="address" disabled>
                        <small class="form-text text-muted">Address cannot be changed.</small>
                    </div>
                    <div class="form-group mb-3">
                        <label for="pincode">Pincode</label>
                        <input type="text" class="form-control" id="pincode" v-model="pincode" required maxlength="6" pattern="[0-9]{6}" title="Pincode must be 6 digits">
                    </div>
                    <div class="form-group mb-3">
                        <label for="total_slots">Total Slots (Capacity)</label>
                        <input type="number" class="form-control" id="total_slots" v-model.number="total_slots" required min="1">
                    </div>
                    <div class="form-group mb-4">
                        <label for="price">Price per Hour</label>
                        <input type="number" class="form-control" id="price" v-model.number="price" required step="0.01" min="0">
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block btn-lg">Update Parking Lot</button>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            location: '',
            address: '',
            pincode: '',
            total_slots: null,
            price: null,
        };
    },
    methods: {
        async fetchParkingLotDetails() {
            const plotId = this.$route.params.plot_id; 

            try {
                const res = await fetch(`${location.origin}/api/parking_lot/${plotId}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.$store.commit('showToast', { message: errorData.message || 'Failed to load parking lot details.', type: 'danger' });
                    this.$router.push('/admin/dashboard'); 
                    return;
                }

                const data = await res.json();
                this.location = data.location;
                this.address = data.address;
                this.pincode = data.pincode;
                this.total_slots = data.total_slots;
                this.price = data.price;

            } catch (error) {
                this.$store.commit('showToast', { message: 'Network error. Could not load parking lot details.', type: 'danger' });
                console.error('Network error fetching parking lot:', error);
                this.$router.push('/admin/dashboard'); 
            }
        },
        async submitForm() {
            const plotId = this.$route.params.plot_id; 

            if (!this.pincode || this.total_slots === null || this.price === null) {
                this.$store.commit('showToast', { message: 'Please fill in all required fields.', type: 'warning' });
                return;
            }
            if (!/^\d{6}$/.test(this.pincode)) {
                this.$store.commit('showToast', { message: 'Pincode must be exactly 6 digits.', type: 'warning' });
                return;
            }
            if (this.total_slots <= 0) {
                this.$store.commit('showToast', { message: 'Total Slots must be a positive number.', type: 'warning' });
                return;
            }
            if (this.price < 0) {
                this.$store.commit('showToast', { message: 'Price must be a non-negative number.', type: 'warning' });
                return;
            }

            try {
                const res = await fetch(`${location.origin}/api/parking_lot/${plotId}`, {
                    method: 'PATCH', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({
                        pincode: this.pincode,
                        total_slots: this.total_slots,
                        price: this.price,
                    }),
                });

                if (res.ok) {
                    console.log('Parking lot updated successfully!');
                    this.$store.commit('showToast', { message: data.message || 'Parking lot updated successfully!', type: 'success' });
                    this.$router.push('/admin/dashboard'); 
                } else {
                    const errorData = await res.json();
                    console.error('Failed to update parking lot:', res.status, errorData.message || res.statusText);
                    this.$store.commit('showToast', { message: errorData.message || 'Failed to update parking lot.', type: 'danger' }); 
                    this.$router.push('/admin/dashboard'); 
                }
            } catch (error) {
                console.error('Network error during update:', error);
                this.$store.commit('showToast', { message: 'Network error. Could not update parking lot. Please try again.', type: 'danger' });
                this.$router.push('/admin/dashboard'); 
            }
        },
    },
    async mounted() {
        await this.fetchParkingLotDetails();
    },
};
