import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import UserDashboard from "../pages/UserDashboard.js";
import store from "../utils/store.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import AddPLot from "../pages/AddPLot.js";
import EditPLot from "../pages/EditPLot.js";
import Profile from "../pages/Profile.js"
import UserAnalytics from "../pages/UserAnalytics.js";
import UserHistory from "../pages/UserHistory.js";
import About from "../pages/About.js"
import Bookings from "../pages/Bookings.js";
import Analytics from "../pages/Analytics.js"; 

Vue.use(VueRouter);

const Home = {
    template: `
        <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light p-0">
            <div class="row w-100 m-0 p-4">
                <!-- Left Half: Image Section -->
                <div class="col-12 col-md-6 d-flex align-items-center justify-content-center p-0">
                    <div class="position-relative w-100 h-100 d-flex align-items-center justify-content-center" style="min-height: 400px;">
                        <img src="https://static.vecteezy.com/system/resources/previews/023/642/030/non_2x/parking-smartphone-app-public-car-park-urban-transport-tiny-woman-looking-for-parking-lot-for-park-automobile-modern-flat-cartoon-style-illustration-on-white-background-vector.jpg" class="img-fluid w-100 h-100 object-fit-cover rounded-lg " >
                    </div>
                </div>

                <!-- Right Half: Content Section -->
                <div class="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center p-4 p-md-5 text-center">
                    <h1 class="display-4 font-weight-bold text-dark mb-3">
                        PARKEASY - Vehicle Parking Management App
                    </h1>
                    <p class="lead text-muted mb-4 max-width-500">
                        Seamlessly find and book parking spots, manage your vehicle's stay, and enjoy a hassle-free parking experience. Your smart solution for urban parking.
                    </p>
                    <div class="d-flex flex-column flex-sm-row justify-content-center w-100" style="max-width: 400px;">
                        <router-link to="/login" class="btn btn-outline-primary btn-lg flex-fill mb-3 mb-sm-0 mr-sm-3">
                            Sign In
                        </router-link>
                        <router-link to="/register" class="btn btn-outline-primary btn-lg flex-fill">
                            Sign Up
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    `,
}

const routes = [
    {path: "/", component: Home},
    {path: "/login", component: LoginPage},
    {path: "/register", component: RegisterPage},
    {path: "/api/parking_lots", component: UserDashboard, meta : { requiresLogin: true } },
    {path: "/admin/dashboard", component: AdminDashboard, meta: { requiresLogin: true, roles: ['admin'] } },
    {path: "/add_parking_lot", component: AddPLot, meta: { requiresLogin: true, roles: ['admin'] } },
    {path: "/edit_parking_lot/:plot_id", component: EditPLot, meta: { requiresLogin: true, roles: ['admin'] } },
    {
        path: "/profile",
        component: Profile,
        meta: { requiresLogin: true, roles: ['user', 'admin'] } 
    },
    {path:"/api/users", component: UserAnalytics, meta: {requiresLogin: true, roles: ['admin']}},
    {path:"/history", component: UserHistory, meta: {requiresLogin: true, roles: ['user']}},
    {path:"/about", component: About},
    {path: "/bookings", component: Bookings, meta: {requiresLogin: true, roles: ['admin']}},
    {
        path: "/analytics", 
        component: Analytics,
        meta: { requiresLogin: true, roles: ['admin'] }
    },
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresLogin)) {
        if (!store.state.loggedin) {
            next({ path: '/login' });
        } else if (
            to.meta.roles &&
            !to.meta.roles.some(role => store.state.roles && store.state.roles.includes(role))
        ) {
            store.commit('showToast', {
                message: 'You are not authorized to access this page.',
                type: 'danger'
            });
            next({ path: '/' });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;