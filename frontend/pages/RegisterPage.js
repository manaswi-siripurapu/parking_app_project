export default {
    name: 'RegisterPage',
    template: `
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card shadow-lg p-4 p-md-5" style="max-width: 500px; width: 100%;">
                <h2 class="card-title text-center mb-4">Sign Up for ParkEasy</h2>
                <form @submit.prevent="submitRegister">
                    <div class="form-group mb-3">
                        <label for="username">Username</label>
                        <input type="text" class="form-control" id="username" placeholder="Choose a username" v-model="username" required>
                    </div>
                    <div class="form-group mb-3">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter your email" v-model="email" required>
                    </div>
                    <div class="form-group mb-3">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Create a password" v-model="password" required>
                    </div>
                    <div class="form-group mb-3">
                        <label for="mobile_num">Mobile Number</label>
                        <input type="tel" class="form-control" id="mobile_num" placeholder="Enter your 10-digit mobile number" v-model="mobile_num" required pattern="[0-9]{10}" title="Mobile number must be 10 digits">
                    </div>
                    <div class="form-group mb-4">
                        <label for="age">Age</label>
                        <input type="number" class="form-control" id="age" placeholder="Enter your age" v-model.number="age" required min="18">
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block btn-lg">Register</button>
                </form>

                <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
                    {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="alert alert-success mt-4" role="alert">
                    {{ successMessage }}
                </div>
                <p class="text-center mt-3">
                    Already have an account? <router-link to="/login">Sign In</router-link>
                </p>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            email: '',
            password: '',
            mobile_num: '',
            age: null,
            errorMessage: '',   
            successMessage: '', 
        }
    },
    methods: {
        async submitRegister() {
            this.errorMessage = '';   
            this.successMessage = ''; 

            if (!this.username || !this.email || !this.password || !this.mobile_num || this.age === null) {
                this.errorMessage = 'Please fill in all required fields.';
                return;
            }
            if (!/^\d{10}$/.test(this.mobile_num)) {
                this.errorMessage = 'Mobile number must be exactly 10 digits.';
                return;
            }
            if (this.age !== null && this.age < 18) { // Check if age is provided and less than 18
                this.errorMessage = 'You must be at least 18 years old to register.';
                return;
            }

            try {
                const res = await fetch(location.origin + '/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        'username': this.username,
                        'email': this.email,
                        'password': this.password,
                        'mobile_num': this.mobile_num,
                        'age': this.age,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    this.successMessage = data.message || 'Registration successful! You can now log in.';
                    
                    // Clear form fields
                    this.username = '';
                    this.email = '';
                    this.password = '';
                    this.mobile_num = '';
                    this.age = null;

                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 1000);
                } else {
                    const errorData = await res.json();
                    if (res.status === 409) {
                        this.errorMessage = errorData.error || 'User with this email or username already exists.';
                    } else {
                        this.errorMessage = errorData.error || 'Registration failed. Please try again.';
                    }
                }
            } catch (error) {
                this.errorMessage = 'Network error or unexpected issue. Please check your connection and try again.';
                console.error('Network error during registration:', error);
            }
        }
    }
}
