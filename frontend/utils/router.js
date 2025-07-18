import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import ParkingLotList from "../pages/ParkingLotList.js";
import store from "../utils/store.js";

const Home = {
    template: `
        <div>
            <h1>Welcome to the Parking App</h1>
            <p>
                Please 
                <router-link to="/login">login</router-link> 
                or 
                <router-link to="/register">register</router-link> 
                to continue.
            </p>
        </div>
    `,
}

const routes = [
    {path: "/", component: Home},
    {path: "/login", component: LoginPage},
    {path: "/register", component: RegisterPage},
    {path: "/api/parking_lots", component: ParkingLotList, meta : { requiresLogin: true, roles: ['user'] } },
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
            alert('role not authorized');
            next({ path: '/' });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;