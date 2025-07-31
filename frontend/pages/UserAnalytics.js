export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">Users</h1>
            <p class="lead text-center text-muted mb-4">Manage users and their statuses.</p>

            <!-- Search Bar -->
            <div class="mb-4">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search by username or email" v-model="searchQuery" @keyup.enter="fetchUsers">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" @click="fetchUsers">Search</button>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading users...</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                {{ errorMessage }}
            </div>

            <div v-else-if="users.length === 0" class="alert alert-info text-center" role="alert">
                No users found.
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Age</th>
                            <th>Role(s)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.user_id">
                            <td>{{ user.user_id }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.mobile_num }}</td>
                            <td>{{ user.age }}</td>
                            <td>
                                <span v-for="role in user.roles" :key="role" class="badge badge-secondary mr-1">{{ role }}</span>
                            </td>
                            <td>
                                <span :class="{'badge badge-success': user.active, 'badge badge-danger': !user.active}">
                                    {{ user.active ? 'Active' : 'Blocked' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="text-center my-4">
                <button class="btn btn-primary btn-lg" @click="downloadUsersCSV">
                    Download User Details
                </button>
            </div>
        </div>
    `,
    data() {
        return {
            users: [],
            isLoading: true,
            errorMessage: '',
            searchQuery: '',
        };
    },
    methods: {
        async fetchUsers() {
            this.isLoading = true;
            this.errorMessage = '';
            const url = this.searchQuery 
                ? `${location.origin}/api/users?query=${encodeURIComponent(this.searchQuery)}`
                : `${location.origin}/api/users`;

            try {
                const res = await fetch(url, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load users.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                    console.error('Failed to fetch users:', res.status, errorData.message || res.statusText);
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('logout');
                        this.$router.push('/login');
                    }
                    return;
                }
                this.users = await res.json();
            } catch (error) {
                this.errorMessage = 'Network error. Could not connect to the server.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                console.error('Network error fetching users:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async toggleUserStatus(userId, newStatus) {
            if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'block'} this user?`)) {
                return;
            }
            try {
                const res = await fetch(`${location.origin}/api/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({ active: newStatus }),
                });

                if (res.ok) {
                    const updatedUser = await res.json();
                    this.$store.commit('showToast', { message: `User ${updatedUser.username} ${updatedUser.active ? 'activated' : 'blocked'} successfully!`, type: 'success' });
                    // Update the user in the local array to reflect the change
                    const index = this.users.findIndex(u => u.user_id === userId);
                    if (index !== -1) {
                        this.$set(this.users, index, updatedUser); // Use Vue.$set for reactivity
                    }
                } else {
                    const errorData = await res.json();
                    this.$store.commit('showToast', { message: errorData.message || 'Failed to update user status.', type: 'danger' });
                    console.error('Failed to update user status:', res.status, errorData.message || res.statusText);
                }
            } catch (error) {
                this.$store.commit('showToast', { message: 'Network error during status update. Please try again.', type: 'danger' });
                console.error('Network error during status update:', error);
            }
        },
        async downloadUsersCSV() {
            try {
                const res = await fetch(`${location.origin}/api/admin/export_users`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to export users');

                this.$store.commit('showToast', { message: "CSV generation started!", type: "success" });

                // Basic polling after 5-7 seconds
                setTimeout(() => {
                    const downloadUrl = `${location.origin}/api/admin/download_users/User_data_${data.task_id}.csv`;
                    window.open(downloadUrl, '_blank');
                }, 7000);
            } catch (error) {
                this.$store.commit('showToast', { message: error.message, type: 'danger' });
                console.error(error);
            }
        },
    },
    async mounted() {
        await this.fetchUsers();
    },
};
