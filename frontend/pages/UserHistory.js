export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">My Booking History</h1>
            <p class="lead text-center text-muted mb-4">View your past and current parking sessions.</p>

            <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading booking history...</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                {{ errorMessage }}
            </div>

            <div v-else-if="bookings.length === 0" class="alert alert-info text-center" role="alert">
                You have no booking history yet.
            </div>

            <div v-else class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6" v-for="booking in bookings" :key="booking.booking_id">
                    <div class="card shadow-sm mb-3">
                        <div :class="{'card-header': true, 'bg-success text-white': booking.end_time !== null, 'bg-warning text-dark': booking.end_time === null}">
                            <h5 class="mb-0">
                                Booking ID: {{ booking.booking_id }} 
                                <span v-if="booking.end_time === null" class="badge badge-light float-right">Active</span>
                                <span v-else class="badge badge-light float-right">Completed</span>
                            </h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Parking Lot:</strong> {{ booking.parking_lot_location }}</p>
                            <p><strong>Spot ID:</strong> {{ booking.parking_spot_id }}</p>
                            <p><strong>Started At:</strong> {{ formatDateTime(booking.start_time) }}</p>
                            <p v-if="booking.end_time"><strong>Ended At:</strong> {{ formatDateTime(booking.end_time) }}</p>
                            <p v-if="booking.end_time"><strong>Total Cost:</strong> ₹{{ booking.total_cost }}</p>
                            <p v-else><strong>Current Cost:</strong> Calculating upon release</p>

                            <button v-if="booking.end_time === null"
                                    class="btn btn-warning btn-block mt-3"
                                    @click="releaseSpot(booking.booking_id)">
                                Release Spot
                            </button>
                        </div>
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
        };
    },
    methods: {
        async fetchBookings() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const res = await fetch(`${location.origin}/api/bookings`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load booking history.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                    console.error('Failed to fetch bookings:', res.status, errorData.message || res.statusText);
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('logout');
                        this.$router.push('/login');
                    }
                    return;
                }
                const allBookings = await res.json();
                // Filter for current user's bookings and sort by start_time (most recent first)
                this.bookings = allBookings
                    .filter(b => b.user_id === this.$store.state.user_id)
                    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

            } catch (error) {
                this.errorMessage = 'Network error. Could not load booking history.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                console.error('Network error fetching bookings:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async releaseSpot(bookingId) {
            if (!confirm('Are you sure you want to release this spot?')) {
                return;
            }
            try {
                const res = await fetch(`${location.origin}/api/bookings/${bookingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.$store.commit('showToast', { message: `Spot released! Cost: ₹${data.total_cost}`, type: 'success' });
                    console.log('Spot released:', data);
                    // Re-fetch bookings to update the list, showing the released booking as completed
                    this.fetchBookings(); 
                } else {
                    const errorData = await res.json();
                    this.$store.commit('showToast', { message: errorData.message || 'Failed to release spot.', type: 'danger' });
                    console.error('Release failed:', res.status, errorData.message || res.statusText);
                }
            } catch (error) {
                this.$store.commit('showToast', { message: 'Network error during release. Please try again.', type: 'danger' });
                console.error('Network error during release:', error);
            }
        },
        formatDateTime(datetimeStr) {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            return new Date(datetimeStr).toLocaleString(undefined, options);
        },

    },
    async mounted() {
        await this.fetchBookings();
    },
    watch: {
        '$store.state.user_id': {
            handler(newUserId, oldUserId) {
                if (newUserId !== oldUserId) {
                    this.fetchBookings();
                }
            },
        }
    }
};
