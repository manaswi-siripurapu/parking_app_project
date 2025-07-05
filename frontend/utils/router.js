import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

const Home = {
    template: "<h1> welcome to the home page </h1>",
}

const routes = [
    {path: "/", component: Home},
    {path: "/login", component: LoginPage},
    {path: "/register", component: RegisterPage}
]

const router = new VueRouter({
    routes
})



export default router;