export default {
  template:`
    <div>
        <input type="text" placeholder="Username" v-model="username" />
        <input type="email" placeholder="Email" v-model="email" />
        <input type="password" placeholder="Password" v-model="password" />
        <button class='btn btn-primary' @click="submitRegister"> Register </button>
    </div>
    `,
    data() {
        return {
            username: null,
            email: null,
            password: null,
            role: 'user', // Default role
        }
    },
    methods: {
        async submitRegister() {
            const res = await fetch(location.origin + '/register', 
                {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({'username': this.username, 'email': this.email,'password': this.password, 'role': this.role}),});
            if (res.ok) {
                console.log('signin successful');
            }
        }
    }
}