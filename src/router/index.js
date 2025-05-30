import { createRouter, createWebHistory } from "vue-router";
import SignIn from "@/view/signin_screen.vue";
import Dashboard from "@/view/dashboard_screen.vue";
import Profile from "@/view/profile_screen.vue";
import Class from "@/view/class_screen.vue";
import TrackStudentsComponent from "@/view/track_screen.vue";

const routes = [
  {
    path: "/",
    redirect: "/signin", // Redirect root to SignIn page
  },
  {
    path: '/track-students',
  name: 'TrackStudents', 
  component: TrackStudentsComponent
  },
  {
    path: "/class",
    name: "Class",
    component: Class,
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
  
  // Add other routes like signup and forgot-password later
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
