import { createPinia, PiniaVuePlugin } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export { pinia, PiniaVuePlugin };
export * from "./courseStore";
export * from "./timetableStore";
export default pinia;
