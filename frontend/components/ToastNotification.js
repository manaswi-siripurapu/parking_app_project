export default {
    template: `
        <div v-if="$store.state.toast.show"
             class="toast fade show position-fixed"
             role="alert"
             aria-live="assertive"
             aria-atomic="true"
             style="bottom: 20px; right: 20px; z-index: 1050; min-width: 360px;"
             :class="toastClass"
        >
            <div class="toast-header">
                <strong class="mr-auto">{{ toastTitle }}</strong>
                <button type="button" class="ml-2 mb-1 close" @click="hideToast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body bg-white text-dark">
                {{ $store.state.toast.message }}
            </div>
        </div>
    `,
    computed: {
        toastClass() {
            switch (this.$store.state.toast.type) {
                case 'success':
                    return 'bg-success text-white';
                case 'danger':
                    return 'bg-danger text-white';
                case 'warning':
                    return 'bg-warning text-dark';
                case 'info':
                default:
                    return 'bg-info text-white';
            }
        },
        toastTitle() {
            switch (this.$store.state.toast.type) {
                case 'success': return 'Success!';
                case 'danger':  return 'Error!';
                case 'warning': return 'Warning!';
                case 'info':
                default:        return 'Notification';
            }
        }
    },
    methods: {
        hideToast() {
            this.$store.commit('hideToast');
        }
    },
    watch: {
        '$store.state.toast.show'(newValue) {
            if (newValue) {
                setTimeout(() => {
                    this.hideToast();
                }, 4000); // FIX: Hide after 2 seconds
            }
        }
    }
};
