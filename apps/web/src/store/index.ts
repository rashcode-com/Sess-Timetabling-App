import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export { pinia };
export * from "./courseStore";
export * from "./timetableStore";
export default pinia;
