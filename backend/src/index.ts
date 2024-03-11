import {
  getUserDataByEmail,
  getUserDataById,
} from "./firebase/auth/Authentication.js";
import dotenv from "dotenv";

import { logOutUser, loginUser } from "./controllers/user.controller.js";
import { Login, Register, User } from "./models/user.model.js";
import { app } from "./app.js";
import { getAccessToken } from "./firebase/auth/TokenHandler.js";
import { verifyJwt } from "./middlewares/auth.middlewares.js";
import {
  addUserToFirestore,
  deleteUserFromFireStore,
  updateUserDataInFirestore,
} from "./firebase/db/user.firestore.js";
dotenv.config();

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running in port ${process.env.PORT}`);
});
app.get("/test", (_, res) => {
  res.json("Tesing..");
});

//!Testing
// const userId = await getUserDataByEmail("aayush@gmail.com");
// console.log(userId);

const user: User = {
  uid: "User1",
  avatar: "sadas.png",
  email: "aayush@gmail.com",
  fullName: "Aayush Lamichhane",
  phoneNumber: "+9779813425299",
  refreshToken: "aasdddddddddffffffffffascccccccccasdawdsdarwfafwaf",
};

const user2: User = {
  uid: "User2",
  avatar: "sadas.png",
  email: "aayushd2e23sad@gmail.com",
  fullName: "Aayush Lamichhane",
  phoneNumber: "+9779813425299",
  refreshToken: "aasdddddddddffffffffffascccccccccasdawdsdarwfafwaf",
};

//! Test Data. Remove Later
const data: User = {
  email: "aayush02@gmail.com",
  avatar: "img.png",
  fullName: "Aayush",
  refreshToken: "",
  uid: "newUser",
  phoneNumber: "+9779813490002",
};

// await addUserToFirestore(data, { privilage: "customers" });
// await deleteUserFromFireStore(user2.uid, { privilage: "customers" });

// const userId = await getUser({
//   email: "aayush@gmail.com",
//   password: "sadasdsadsa",
// });
// const uid = await createUser(data);
// console.log(userId);
// console.log(uid);
