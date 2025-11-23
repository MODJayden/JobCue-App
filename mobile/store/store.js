import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./user";
import serviceReducer from "./service";
import artisanReducer from "./artisan";
import imageUploadReducer from "./imageUpload";
import serviceArea from "./serviceArea";
import bookingReducer from "./booking";
import chatReducer from "./chat";

const store = configureStore({
  reducer: {
    auth: authReducer,
    service: serviceReducer,
    artisan: artisanReducer,
    imageUpload: imageUploadReducer,
    serviceArea: serviceArea,
    booking: bookingReducer,
    chat: chatReducer,
  },
});

export default store;
