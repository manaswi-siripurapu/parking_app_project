import PLotCard from "../components/PLotCard.js";

export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">Parking Lots</h1>
            <p class="lead text-center text-muted mb-4">
                {{ parkingLots.length }} Parking Lots Available
            </p>

            <!-- Active Booking Display -->
            <!-- Session Card: show for user role always -->
            <div v-if="$store.state.loggedin && $store.state.roles && $store.state.roles.includes('user')" class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Your Current Parking Session</h5>
                </div>
                <div class="card-body">
                    <div v-if="activeBookingLoading" class="text-center">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <small class="ml-2">Checking active session...</small>
                    </div>

                    <!-- ✅ booking exists -->
                    <div v-else-if="activeBooking">
                        <p><strong>Booking ID:</strong> {{ activeBooking.booking_id }}</p>
                        <p><strong>Parking Lot:</strong> {{ activeBooking.parking_lot_location }}</p>
                        <p><strong>Spot ID:</strong> {{ activeBooking.parking_spot_id }}</p>
                        <p><strong>Started At:</strong> {{ formatDateTime(activeBooking.start_time) }}</p>

                        <button class="btn btn-danger" @click="showReleaseModal(activeBooking.booking_id)">Release Spot</button>
                    </div>

                    <!-- ❌ no active booking -->
                    <div v-else class="alert alert-info my-2" role="alert">
                        You currently have no active parking sessions.
                    </div>
                </div>
            </div>


            <!-- Parking Lots List -->
            <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading parking lots...</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                {{ errorMessage }}
            </div>

            <div v-else-if="parkingLots.length === 0" class="alert alert-info text-center" role="alert">
                No parking lots found.
            </div>

            <div v-else class="row justify-content-center">
                <div class="col-12 col-md-6 col-lg-4 mb-4" v-for="parkingLot in parkingLots" :key="parkingLot.plot_id">
                    <PLotCard
                        :parking-lot="parkingLot"
                        @parking-lot-deleted="handleParkingLotDeleted"
                        @booking-created="handleBookingCreated" 
                    />
                </div>
            </div>

            <!-- Release Confirmation Modal -->
            <div class="modal fade" id="releaseModal" tabindex="-1" aria-labelledby="releaseModalLabel" aria-hidden="true" ref="releaseModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content rounded-3 shadow">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="releaseModalLabel">Release Parking Spot</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to release this parking spot?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger rounded-pill" @click="confirmRelease">Yes, Release</button>
                    </div>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            parkingLots: [],
            isLoading: true,
            errorMessage: '',
            activeBooking: null,        // To store the user's active booking
            activeBookingLoading: true, // Loading state for active booking
            releaseModalInstance: null,
            releaseBookingId: null,
        };
    },
    methods: {
        async fetchParkingLots() {
            this.isLoading = true;
            this.errorMessage = ''; 

            try {
                const res = await fetch(location.origin + '/api/parking_lots', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) { 
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load parking lots.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                    console.error('Failed to fetch parking lots:', res.status, errorData.message || res.statusText);
                    
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('showToast', { message: 'You are not authorized to view this content. Please log in.', type: 'danger' });
                        this.$store.commit('logout');
                        this.$router.push('/login');
                    }
                    return;
                }

                this.parkingLots = await res.json();
            } catch (error) {
                this.errorMessage = 'Network error. Could not connect to the server. Please try again.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                console.error('Network error fetching parking lots:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchActiveBooking() {
            this.activeBookingLoading = true;
            try {
                const res = await fetch(`${location.origin}/api/bookings`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });

                if (res.status === 204) {
                    this.$store.commit('setActiveBooking', null);
                    this.activeBooking = null;
                } else {
                    const booking = await res.json();

                    // ✅ Add this validation check:
                    if (
                        booking &&
                        booking.booking_id &&
                        booking.start_time &&
                        booking.parking_lot_location &&
                        booking.parking_spot_id
                    ) {
                        this.activeBooking = booking;
                        this.$store.commit('setActiveBooking', booking);
                    } else {
                        this.activeBooking = null;
                        this.$store.commit('setActiveBooking', null);
                    }
                }

            } catch (error) {
                console.error('Network error fetching active booking:', error);
                this.$store.commit('showToast', {
                    message: 'Network error while fetching booking.',
                    type: 'danger'
                });
            } finally {
                this.activeBookingLoading = false;
            }
        },
        async releaseSpot(bookingId) {
            if (!bookingId) {
                console.error('Booking ID is missing:', bookingId);
                return;
            }

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
                this.$store.commit('showToast', {
                    message: `Spot released! Cost: ₹${data.total_cost}`,
                    type: 'success'
                });
                this.fetchBookings?.(); // Only in history
                this.fetchParkingLots?.(); // Only in dashboard
                } else {
                try {
                    const errorData = await res.json();
                    this.$store.commit('showToast', {
                    message: errorData.message || 'Failed to release spot.',
                    type: 'danger'
                    });
                } catch (jsonErr) {
                    this.$store.commit('showToast', {
                    message: 'Unexpected server response. Please try again.',
                    type: 'danger'
                    });
                    console.error('Non-JSON response received:', jsonErr);
                }
                }

            } catch (error) {
                this.$store.commit('showToast', {
                message: 'Network error during release. Please try again.',
                type: 'danger'
                });
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
        handleBookingCreated() {
            // Give backend a moment to process and store the booking
            setTimeout(() => {
                this.fetchActiveBooking();
                this.fetchParkingLots();
            }, 300); // 300ms delay
        },
        handleParkingLotDeleted(deletedPlotId) {
            this.parkingLots = this.parkingLots.filter(plot => plot.plot_id !== deletedPlotId);
        },
        // Triggered when user clicks the Release button
        showReleaseModal(bookingId) {
            this.releaseBookingId = bookingId;
            const modal = new bootstrap.Modal(this.$refs.releaseModal);
            modal.show();
            this.releaseModalInstance = modal;
        },

        // Triggered when user confirms inside modal
        async confirmRelease() {
            const bookingId = this.releaseBookingId;
            this.releaseModalInstance.hide();
            console.log("Releasing ID:", this.releaseBookingId);
            this.$store.commit('showToast', { message: 'Releasing spot...', type: 'info' });

            try {
                const res = await fetch(`${location.origin}/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token
                }
                });

                if (res.ok) {
                const data = await res.json();
                this.$store.commit('showToast', { message: `Spot released! Cost: ₹${data.total_cost}`, type: 'success' });
                this.activeBooking = null;
                this.fetchParkingLots();
                } else {
                const errorData = await res.json();
                this.$store.commit('showToast', { message: errorData.message || 'Failed to release spot.', type: 'danger' });
                }
            } catch (error) {
                console.error('Network error during release:', error);
                this.$store.commit('showToast', { message: 'Network error during release.', type: 'danger' });
            }
        },

    },
    async mounted() {
        await Promise.all([
            this.fetchParkingLots(),
            this.fetchActiveBooking()
        ]);
    },
    watch: {
        '$store.state.user_id': {
            handler(newUserId, oldUserId) {
                if (newUserId !== oldUserId) {
                    this.fetchActiveBooking();
                }
            },
        }
    },
    components : {
        PLotCard,
    }
}

