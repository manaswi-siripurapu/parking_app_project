export default {
    template: `
        <div class="p-4">
            <h1> Add New Parking Lot </h1>
            <form @submit.prevent="submitForm">
                <div class="mb-3">
                    <label for="location" class="form-label">Location</label>
                    <input type="text" class="form-control" id="location" v-model="location" required>
                </div>
                <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <input type="text" class="form-control" id="address" v-model="address" required>
                </div>
                <div class="mb-3">
                    <label for="pincode" class="form-label">Pincode</label>
                    <input type="text" class="form-control" id="pincode" v-model="pincode" required maxlength="6">
                </div>
                <div class="mb-3">
                    <label for="total_slots" class="form-label">Total Slots (Capacity)</label>
                    <input type="number" class="form-control" id="total_slots" v-model.number="total_slots" required>
                </div>
                <div class="mb-3">
                    <label for="price" class="form-label">Price per Hour</label>
                    <input type="number" class="form-control" id="price" v-model.number="price" required step="0.01">
                </div>
                <button type="submit" class="btn btn-primary">Add Parking Lot</button>
            </form>
        </div>
    `,
    data() {
        return {
            location: '',
            address: '',   // Added: Required by backend
            pincode: '',   // Added: Required by backend
            total_slots: null, // Corrected: Renamed from 'capacity'
            price: null,
        };
    },
    methods: {
        async submitForm() {
            // Basic client-side validation (added for better UX)
            if (!this.location || !this.address || !this.pincode || this.total_slots === null || this.price === null) {
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
                const res = await fetch(location.origin + '/api/parking_lots', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({
                        location: this.location,
                        address: this.address,
                        pincode: this.pincode,
                        total_slots: this.total_slots,
                        price: this.price,
                    }),
                });

                if (res.ok) {
                    const data = await res.json(); // Read response even if not used directly
                    this.$store.commit('showToast', { message: 'Parking lot added successfully!', type: 'success' });
                    console.log('Parking lot added successfully:', data);
                    // Clear form fields
                    this.location = '';
                    this.address = '';
                    this.pincode = '';
                    this.total_slots = null;
                    this.price = null;
                    // Redirect after a short delay for user to see success message
                    setTimeout(() => {
                        this.$router.push('/admin/dashboard');
                    }, 200);
                } else {
                    const errorData = await res.json();
                    this.$store.commit('showToast', {
                        message: errorData.message || 'Failed to add parking lot.',
                        type: 'danger'
                    });
                    console.error('Failed to add parking lot:', res.status, errorData.message || res.statusText);
                    if (res.status === 403) {
                        // Specific handling for permission denied
                        this.$store.commit('showToast', { message: 'You do not have permission to add parking lots. Redirecting to login.', type: 'danger' });
                        setTimeout(() => {
                            this.$store.commit('logout');
                            this.$router.push('/login');
                        }, 200);
                    }
                }
            } catch (error) {
                this.$store.commit('showToast', { message: 'Network error or unexpected issue. Please try again.', type: 'danger' });
                console.error('Network error during add parking lot:', error);
            }
        },
    },
    components: {
        // Add any components you might need here
    },
};