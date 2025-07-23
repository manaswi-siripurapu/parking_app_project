import PLotCard from "../components/PLotCard.js";

export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">Parking Lots</h1>
            <p class="lead text-center text-muted mb-4">
                {{ parkingLots.length }} Parking Lots Available
            </p>

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
                <template v-if="$store.state.roles && $store.state.roles.includes('admin')">
                    Click "Add New Parking Lot" to get started!
                </template>
            </div>

            <div v-else class="row justify-content-center">
                <div class="col-12 col-md-6 col-lg-4 mb-4" v-for="parkingLot in parkingLots" :key="parkingLot.plot_id">
                    <PLotCard :parking-lot="parkingLot" />
                </div>
            </div>

            <!-- This button was in your original AdminDashboard.js context -->
            <div class="text-center my-4">
                <button class="btn btn-primary btn-lg" @click="addNewParkingLot"
                        v-if="$store.state.loggedin && $store.state.roles && $store.state.roles.includes('admin')">
                    Add New Parking Lot
                </button>
            </div>
        </div>
    `,
    data() {
        return {
            parkingLots: [],
            isLoading: true,    
            errorMessage: '',  
        };
    },
    methods: {
        addNewParkingLot() {
            this.$router.push('/add_parking_lot');
        },
        async fetchParkingLots() { // FIX: Extracted fetch logic into a method
            this.isLoading = true;
            this.errorMessage = ''; // Clear previous errors

            try {
                const res = await fetch(location.origin + '/api/parking_lots', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) { 
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load parking lots.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' }); // Use toast for feedback
                    console.error('Failed to fetch parking lots:', res.status, errorData.message || res.statusText);
                    
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('showToast', { message: 'You are not authorized to view this content. Please log in.', type: 'danger' });
                        this.$store.commit('logout'); // Clear invalid token from store
                        this.$router.push('/login'); // Redirect to login page
                    }
                    return; // Stop execution if there's an error
                }

                this.parkingLots = await res.json();
            } catch (error) {
                this.errorMessage = 'Network error. Could not connect to the server. Please try again.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' }); // Use toast for feedback
                console.error('Network error fetching parking lots:', error);
            } finally {
                this.isLoading = false; 
            }
        },
        handleParkingLotDeleted(deletedPlotId) { 
            this.fetchParkingLots(); 
        }
    },
    async mounted() {
        this.fetchParkingLots();
    },
    components : {
        PLotCard,
    }
}          