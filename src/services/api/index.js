import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import UserRepo from "./UserRepo";
import FridgeRepo from "./FridgeRepo";
import InviteRepo from "./InviteRepo";
import PermissionRepo from "./PermissionRepo";
import AuthService from "../AuthService";

import app from "../../firebase/index.js";
const firestore = getFirestore(app);
const auth = getAuth(app);

export const authService = new AuthService(auth);
export const userRepo = new UserRepo(firestore);
export const fridgeRepo = new FridgeRepo(firestore);
export const inviteRepo = new InviteRepo(firestore);
export const permissionRepo = new PermissionRepo(firestore);
