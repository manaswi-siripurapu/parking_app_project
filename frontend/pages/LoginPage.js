export default {
  template:`
    <div>
        <input type="text" placeholder="Username" v-model="username" />
        <input type="email" placeholder="Email" v-model="email" />
        <input type="password" placeholder="Password" v-model="password" />
        <button class='btn btn-primary' @click="submitLogin"> Login </button>
    </div>
    `,
    data() {
        return {
            username: null,
            email: null,
            password: null,
        }
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + '/login', 
                {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({'username': this.username, 'email': this.email,'password': this.password}),});
            if (res.ok) {
                console.log('Login successful');
                const data = await res.json();
                console.log(data);
            }
        }
    }
}