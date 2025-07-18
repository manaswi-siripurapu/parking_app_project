const store = new Vuex.Store({
    state: {
        auth_token: null,
        roles: [],      // store as array if backend returns array
        loggedin: false,
        user_id: null,
    },
    mutations: {
        setUser(state, payload) {
            if (payload) {
                state.auth_token = payload.token;
                state.roles = payload.roles;
                state.loggedin = true;
                state.user_id = payload.user_id;
                localStorage.setItem('user', JSON.stringify(payload));
            } else {
                try {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user) {
                        state.auth_token = user.token;
                        state.roles = user.roles;
                        state.loggedin = true;
                        state.user_id = user.user_id;
                    }
                } catch {
                    console.warn('not logged in');
                }
            }
        },
        logout(state) {
            state.auth_token = null;
            state.roles = null;
            state.loggedin = false;
            state.user_id = null;
            localStorage.removeItem('user');
        }
    },
    actions: {},
});

store.commit('setUser');

export default store;