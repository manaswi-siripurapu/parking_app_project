export default {
    template: `
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card shadow-lg p-4 p-md-5" style="max-width: 600px; width: 100%;">
                <h2 class="card-title text-center mb-4">My Profile</h2>
                
                <div v-if="isLoading" class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-2">Loading profile details...</p>
                </div>

                <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                    {{ errorMessage }}
                </div>

                <div v-else class="profile-details">
                    <div class="mb-3">
                        <strong>Username:</strong> {{ userProfile.username }}
                    </div>
                    <div class="mb-3">
                        <strong>Email:</strong> {{ userProfile.email }}
                    </div>
                    <div class="mb-3">
                        <strong>Mobile Number:</strong> {{ userProfile.mobile_num }}
                    </div>
                    <div class="mb-3">
                        <strong>Age:</strong> {{ userProfile.age }}
                    </div>
                    <div class="mb-3">
                        <strong>Role:</strong> 
                        <span v-for="(role, index) in userProfile.roles" :key="index" class="badge badge-primary mr-1">
                            {{ role }}
                        </span>
                    </div>
                    
                    <hr class="my-4">
                    <!-- Removed active booking display for simplicity -->
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            userProfile: null,
            isLoading: true,
            errorMessage: '',
        };
    },
    methods: {
        async fetchUserProfile() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const res = await fetch(`${location.origin}/api/profile`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                        'Accept': 'application/json'
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.$store.commit('showToast', { message: errorData.message || 'Failed to load profile.', type: 'danger' });
                    console.error('Failed to fetch profile:', res.status, errorData.message || res.statusText);
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('logout');
                        this.$router.push('/login');
                    }
                    return;
                }
                this.userProfile = await res.json();

            } catch (error) {
                this.$store.commit('showToast', { message: 'Network error. Could not load profile.', type: 'danger' });
                console.error('Network error fetching profile:', error);
                this.$router.push('/'); 
            } finally {
                this.isLoading = false;
            }
        },
        // editProfile() {
        //     this.$store.commit('showToast', { message: 'Edit Profile functionality not yet implemented.', type: 'info' });
        //     console.log('Navigate to edit profile page');
        // }
    },
    async mounted() {
        await this.fetchUserProfile();
    },
};
