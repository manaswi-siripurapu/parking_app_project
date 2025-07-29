const store = new Vuex.Store({
    state: {
        auth_token: null,
        roles: [], // Initialize as an empty array
        loggedin: false,
        user_id: null,
        toast: { // This whole 'toast' object must be in state
            show: false,
            message: '',
            type: 'info'
        },
        activeBooking: null,
    },
    mutations: {
        setUser(state, payload) {
            if (payload) {
                state.auth_token = payload.token;
                state.roles = payload.roles || []; // Ensure it's an array, default to empty
                state.loggedin = true;
                state.user_id = payload.user_id;
                localStorage.setItem('user', JSON.stringify(payload));
            } else {
                try {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user) {
                        state.auth_token = user.token;
                        state.roles = user.roles || []; // Ensure it's an array, default to empty
                        state.loggedin = true;
                        state.user_id = user.user_id;
                    }
                } catch {
                    console.warn('not logged in or localStorage item invalid');
                    // Reset state if localStorage item is invalid/corrupted
                    state.auth_token = null;
                    state.roles = [];
                    state.loggedin = false;
                    state.user_id = null;
                    localStorage.removeItem('user');
                }
            }
        },
        logout(state) {
            state.auth_token = null;
            state.roles = []; // Set to empty array, not null
            state.loggedin = false;
            state.user_id = null;
            localStorage.removeItem('user');
        },
        showToast(state, payload) {
            state.toast.show = true;
            state.toast.message = payload.message;
            state.toast.type = payload.type || 'info';
        },
        hideToast(state) {
            state.toast.show = false;
            state.toast.message = '';
            state.toast.type = 'info';
        },
        setActiveBooking(state, booking) {
            state.activeBooking = booking;
        },
    },
    actions: {},
});

store.commit('setUser'); // This line is crucial for initial state hydration

export default store;