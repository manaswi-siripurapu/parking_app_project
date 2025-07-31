export default {
  template:`
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card shadow-lg p-4 p-md-5" style="max-width: 500px; width: 100%;">
                <h2 class="card-title text-center mb-4">Sign In to ParkEasy</h2>
                <form @submit.prevent="submitLogin">
                    <div class="form-group mb-3">
                        <label for="username">Username</label>
                        <input type="text" class="form-control" id="username" placeholder="Enter your username" v-model="username" required>
                    </div>
                    <div class="form-group mb-3">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter your email" v-model="email" required>
                    </div>
                    <div class="form-group mb-4">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Enter your password" v-model="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block btn-lg">Login</button>
                </form>

                <p class="text-center mt-3">
                    Don't have an account? <router-link to="/register">Sign Up</router-link>
                </p>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            email: '',
            password: '',
        }
    },
    methods: {
        async submitLogin() {
            if (!this.username || !this.email || !this.password) {
                this.$store.commit('showToast', { message: 'Please fill in all fields.', type: 'warning' });
                return;
            }

            try { 
                const res = await fetch(location.origin + '/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        'username': this.username,
                        'email': this.email,
                        'password': this.password
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    this.$store.commit('setUser', {
                        token: data.token,
                        roles: data.user.roles,
                        user_id: data.user.user_id,
                    });
                    localStorage.setItem('user', JSON.stringify({
                        token: data.token,
                        roles: data.user.roles,
                        user_id: data.user.user_id,
                    }));

                    this.$store.commit('showToast', { message: 'SignIn successful!', type: 'success' });

                    if (data.user.roles && data.user.roles.includes('admin')) {
                        this.$router.push('/admin/dashboard'); 
                    } else {
                        this.$router.push('/api/parking_lots'); 
                    }

                } else { 
                    const errorData = await res.json();
                    this.$store.commit('showToast', {
                        message: errorData.error || 'Login failed. Please check your credentials.',
                        type: 'danger'
                    });
                    console.error('Login failed:', res.status, errorData.error || res.statusText);
                }
            } catch (error) { 
                this.$store.commit('showToast', {
                    message: 'Network error or unexpected issue. Please try again.',
                    type: 'danger'
                });
                console.error('Network error during login:', error);
            }
        }
    }
}