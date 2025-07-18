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
                    <label for="total_slots" class="form-label">Capacity</label>
                    <input type="number" class="form-control" id="total_slots" v-model="total_slots" required>
                </div>
                <div class="mb-3">
                    <label for="price" class="form-label">Price per Hour</label>
                    <input type="number" class="form-control" id="price" v-model="price" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Parking Lot</button>
            </form>
        </div>
    `,
    data() {
        return {
            location: '',
            capacity: null,
            price: null,
        };
    },
    methods: {
        async submitForm() {
            const res = await fetch(location.origin + '/api/parking_lots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token,
                },
                body: JSON.stringify({
                    location: this.location,
                    capacity: this.capacity,
                    price: this.price,
                }),
            });
            if (res.ok) {
                console.log('Parking lot added successfully');
                this.$router.push('/api/parking_lots'); // Redirect to parking lot list
            } else {
                console.error('Failed to add parking lot');
            }
        },
    },
    components: {
        // Add any components you might need here
    },
};