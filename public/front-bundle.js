import { c as createApp, a as authService } from './vue.esm-browser-526c66a4.js';

//import store from "../store.js";

function startUI() {
    const app = createApp({
        //components: {},
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
                return (
                    this.disableLogin || this.password != this.passwordConfirm
                );
            },
            disableLogin() {
                return !(this.email && this.password);
            },
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
                    console.log(this.email, this.password);
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
                this.isSigningUp
                    ? !this.disableSignup && (await this.signUp())
                    : !this.disableLogin && (await this.login());
            },
        },
    });

    app.mount("#app");
}

//import { makeFridge } from "./appSetup.js";

//await store.initialize(services);

//store.watchCurrentUserState();

startUI();
