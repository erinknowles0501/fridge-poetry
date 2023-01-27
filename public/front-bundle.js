import { d as defaultWords, b as authService, u as userService, f as fridgeService } from './chunks/api.js';
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
        randomDefaultWords() {
            const numberOfWords = 3;
            const words = [];
            const suitableDefaultWords = defaultWords.filter(
                (word) => word.length > 3
            );
            const randomIndexes = [];

            for (let i = 0; i < numberOfWords; i++) {
                const randomIndex = Math.floor(
                    Math.random() * suitableDefaultWords.length
                );
                if (randomIndexes.includes(randomIndex)) {
                    i--;
                } else {
                    randomIndexes.push(randomIndex);
                }
            }

            randomIndexes.forEach((index) => {
                words.push(suitableDefaultWords[index]);
            });

            return words;
        },
        randomTranslate() {
            return [
                this.getRandomTranslate(),
                this.getRandomTranslate(),
                this.getRandomTranslate(),
            ];
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
        <Transition appear>
            <div class="word-display">
                <div v-for="(word, index) in randomDefaultWords" class="word" :style="'transform: translate(' + randomTranslate[index] + ')'">
                    {{ word }}
                </div>
            </div>
        </Transition>

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
                    case "auth/weak-password":
                        this.error =
                            "Password must be at least 6 characters long.";
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
        getRandomTranslate() {
            const MAX_PX_AMOUNT = 5;
            function getRandom() {
                const sign = Math.random() < 0.5 ? "-" : "";
                return sign + Math.round(Math.random() * MAX_PX_AMOUNT) + "px";
            }
            return getRandom() + ", " + getRandom();
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
    emits: ["newFridge"],
    template: `
        <div class="fridge-selection">
            <div class="welcome">Welcome, <b>{{user.displayName}}</b> <a href="" @click.prevent="logout">(Log out)</a></div>
            <div>Select a fridge:</div>
            <a v-for="fridge in fridges" :href="'/' + fridge.id" class="fridge">{{ fridge.name }}</a>
            <div style="margin-top:1rem;">or, <a href="" @click.prevent="$emit('newFridge')" class="fridge" style="display: inline">create a new fridge...</a></div>
        </div>
    `,
    created() {
        const currentUserUID = userService.auth.currentUser.uid;

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
    methods: {
        async logout() {
            await authService.logout();
            window.location = "/";
        },
    },
};

var NewFridge = {
    data() {
        return {
            name: "",
            isWorking: false,
        };
    },
    template: `
        <div>
            <label><p>New fridge name:</p>
                <input type="text" ref="name" v-model="name" autofocus @keyup.enter="newFridge" :disabled="isWorking" />
            </label>
            <button :disabled="!name || isWorking" @click="newFridge">Make new fridge</button>
        </div>
    `,
    mounted() {
        this.$refs.name.focus();
    },
    methods: {
        async newFridge() {
            try {
                this.$refs.name.blur();
                this.isWorking = true;

                const newFridgeID = await fridgeService.createFridge(this.name);
                window.location = newFridgeID;
            } catch (error) {
                // TODO
                console.log(error);
            }
        },
    },
};

function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection, NewFridge },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @loggedIn="activeComponent = 'FridgeSelection'" @newFridge="activeComponent = 'NewFridge'" />
            </div>
        `,
    });

    app.mount("#app");
}

//import { makeFridge } from "./appSetup.js";

//await store.initialize(services);

//store.watchCurrentUserState();

startUI();
