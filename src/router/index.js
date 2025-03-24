import { createRouter, createWebHistory } from "vue-router";
import SignIn from "@/view/signin_screen.vue";
import SignUp from "@/view/signup_screen.vue";
import Dashboard from "@/view/dashboard_screen.vue";
import Profile from "@/view/profile_screen.vue";

const routes = [
  {
    path: "/",
    redirect: "/signin", // Redirect root to SignIn page
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp,
  }
  // Add other routes like signup and forgot-password later
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
