import { a as authService, u as userService, f as fridgeService } from './api-a3db9990.js';
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

var LoginSignup = {
    emits: ["loggedIn"],
    data() {
        return {
            isSigningUp: false,
            error: "",
            email: "",
            password: "",
            passwordConfirm: "",
        };
    },
    computed: {
        disableSignup() {
            return this.disableLogin || this.password != this.passwordConfirm;
        },
        disableLogin() {
            return !(this.email && this.password);
        },
    },
    created() {
        authService.handleAuthStateChanged((state) => {
            if (state.uid) {
                this.$emit("loggedIn");
            }
        });
    },
    template: `
        <div class="form" @keyup.enter="submitForm">
            <Transition appear>
                <div class="error" v-if="error"><span>Error:</span> {{ error }}</div>
            </Transition>

            <label>
                <p>Email:</p>
                <input type="email" v-model="email" autofocus>
            </label>
            <label>
                <p>Password:</p>
                <input type="password" v-model="password">
            </label>

            <Transition appear>
                <label v-if="isSigningUp">
                    <p>Confirm Password:</p>
                    <input type="password" v-model="passwordConfirm">
                </label>
            </Transition>

            <Transition>
                <div class="button-row" v-if="!isSigningUp">
                    <button @click="isSigningUp = true" class="sub" tabindex="-1">Sign up?</button>
                    <button @click="submitForm" :disabled="disableLogin">Log in</button>
                </div>
                <div class="button-row" v-else>
                    <button @click="isSigningUp = false" class="sub" tabindex="-1">Log in?</button>
                    <button @click="submitForm" :disabled="disableSignup">Sign up</button>
                </div>
            </Transition>
        </div>
    `,
    methods: {
        async login() {
            try {
                await authService.signIn(this.email, this.password);
                return true;
            } catch (error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        this.error = "Invalid email format.";
                        break;
                    case "auth/user-not-found":
                    case "auth/wrong-password":
                        this.error = "Email/password incorrect.";
                        break;
                    default:
                        this.error =
                            "Something's broken - please show us this message: " +
                            error;
                }
            }
        },
        async signUp() {
            try {
                await authService.signUp(this.email, this.password);
                return true;
            } catch (error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        this.error = "Invalid email format.";
                        break;
                    case "auth/email-already-in-use":
                        this.error =
                            "Can't sign up with that email - log in instead, or reset your password.";
                        break;
                    default:
                        this.error =
                            "Something's broken - please show us this message: " +
                            error;
                }
            }
        },
        async submitForm() {
            const success = this.isSigningUp
                ? !this.disableSignup && (await this.signUp())
                : !this.disableLogin && (await this.login());

            if (success) {
                this.$emit("loggedIn");
            }
        },
    },
};

var FridgeSelection = {
    data() {
        return {
            fridges: [],
            user: {},
        };
    },
    template: `
        <div class="fridge-selection">
            <div class="welcome">Welcome, <b>{{user.displayName}}</b></div>
            <div>Select a fridge:</div>
            <a v-for="fridge in fridges" :href="'/' + fridge.id" class="fridge">{{ fridge.name }}</a>
            <div style="margin-top:1rem;">or, <a href="/new" class="fridge" style="display: inline">create a new fridge...</a></div>
        </div>
    `,
    created() {
        const currentUserUID = userService.auth.currentUser.uid;
        console.log("currentUserUID", currentUserUID);

        userService
            .getUserByID(currentUserUID)
            .then((user) => (this.user = user));

        userService.getFridgesByUser(currentUserUID).then(async (fridgeIDs) => {
            this.fridges = await Promise.all(
                fridgeIDs.map(async (fridgeID) => {
                    return await fridgeService.getFridgeByID(fridgeID);
                })
            );
        });
    },
};

function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @loggedIn="activeComponent = 'FridgeSelection'" />
            </div>
        `,
    });

    app.mount("#app");
}

//import { makeFridge } from "./appSetup.js";

//await store.initialize(services);

//store.watchCurrentUserState();

startUI();
