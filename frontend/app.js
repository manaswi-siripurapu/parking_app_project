import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"
import ToastNotification from "./components/ToastNotification.js"

const app = new Vue({
    el : '#app',
    template : `
        <div> 
            <Navbar />
            <router-view> </router-view>
            <ToastNotification />
        </div>
    `,
    components : {
        Navbar,
        ToastNotification,
    },
    router,
    store,
})