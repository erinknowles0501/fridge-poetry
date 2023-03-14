import UserRepo from "./UserRepo";
import FridgeRepo from "./FridgeRepo";
import InviteRepo from "./InviteRepo";
import PermissionRepo from "./PermissionRepo";
import AuthService from "../auth";

export const authService = new AuthService();
export const userRepo = new UserRepo(db, firestore);
export const FridgeRepo = new FridgeRepo(db, firestore);
export const inviteRepo = new InviteRepo(db, firestore);
export const permissionRepo = new PermissionRepo(db, firestore);
