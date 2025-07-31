export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">All Booking Records</h1>
            <p class="lead text-center text-muted mb-4">Overview of all parking sessions by users.</p>

            <div class="d-flex justify-content-center mb-4">
                <div class="btn-group">
                    <button class="btn btn-outline-primary" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
                    <button class="btn btn-outline-success" :class="{ active: filter === 'completed' }" @click="filter = 'completed'">Completed</button>
                    <button class="btn btn-outline-warning" :class="{ active: filter === 'active' }" @click="filter = 'active'">Active</button>
                </div>
            </div>

            <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Fetching all bookings...</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                {{ errorMessage }}
            </div>

            <div v-else-if="filteredBookings.length === 0" class="alert alert-info text-center" role="alert">
                No bookings found for selected filter.
            </div>

            <div v-else>
                <div class="card shadow-sm mb-3" v-for="booking in filteredBookings" :key="booking.booking_id">
                    <div :class="{
                        'card-header': true,
                        'bg-success text-white': booking.end_time,
                        'bg-warning text-dark': !booking.end_time
                    }">
                        <h5 class="mb-0">
                            Booking #{{ booking.booking_id }}
                            <span class="badge float-right" :class="{
                                'badge-light': true,
                                'text-dark': !booking.end_time
                            }">
                                {{ booking.end_time ? 'Completed' : 'Active' }}
                            </span>
                        </h5>
                    </div>
                    <div class="card-body">
                        <p><strong>User:</strong> {{ booking.username }} (ID: {{ booking.user_id }})</p>
                        <p><strong>Parking Lot:</strong> {{ booking.parking_lot_location }}</p>
                        <p><strong>Spot ID:</strong> {{ booking.parking_spot_id }}</p>
                        <p><strong>Start Time:</strong> {{ formatDateTime(booking.start_time) }}</p>
                        <p v-if="booking.end_time"><strong>End Time:</strong> {{ formatDateTime(booking.end_time) }}</p>
                        <p>
                            <strong>Total Cost:</strong>
                            <span v-if="booking.end_time">₹{{ booking.total_cost }}</span>
                            <span v-else>Pending</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bookings: [],
            isLoading: true,
            errorMessage: '',
            filter: 'all' // all | active | completed
        };
    },
    computed: {
        filteredBookings() {
            if (this.filter === 'all') return this.bookings;
            if (this.filter === 'active') return this.bookings.filter(b => !b.end_time);
            if (this.filter === 'completed') return this.bookings.filter(b => b.end_time);
            return this.bookings;
        }
    },
    methods: {
        async fetchAllBookings() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const res = await fetch(`${location.origin}/api/bookings`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load bookings.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                    return;
                }

                const all = await res.json();
                this.bookings = all.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

            } catch (error) {
                this.errorMessage = 'Network error fetching bookings.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                console.error('Booking fetch failed:', error);
            } finally {
                this.isLoading = false;
            }
        },
        formatDateTime(datetimeStr) {
            const istOffset = 5.5 * 60; // IST is UTC+5:30 → in minutes
            const localDate = new Date(datetimeStr);

            // Convert to IST
            const istDate = new Date(localDate.getTime() + istOffset * 60 * 1000);

            return istDate.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // or false if you want 24hr format
            });
        },
    },
    async mounted() {
        await this.fetchAllBookings();
    }
};
