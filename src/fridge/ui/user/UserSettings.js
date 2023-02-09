import { userService } from "../../../services/api";
import { computed, inject, ref } from "vue";

export default {
    setup() {
        const hello = ref("hello!");
        const test2 = computed(() => hello.value + "aaaa", {
            onTrack(e) {
                console.log("e", e);
            },
            onTrigger(e) {
                console.log("e", e);
            },
        });

        const providedStore = inject("providedStore");
        console.log("providedStore", providedStore.value);

        const storeTestColor = computed(
            {
                get: () => {
                    return providedStore.value.user.displayColor;
                },
                set: (value) => {
                    console.log("value", value);

                    providedStore.value.user.displayColor = value;
                },
            },
            {
                onTrack(e) {
                    console.log("store track", e);
                },
                onTrigger(e) {
                    console.log("store trigger", e);
                },
            }
        );
        return { test2, storeTestColor };
    },
    // inject: ["providedStore"],
    data() {
        return {
            localDisplayName: "",
            test: "erin",
        };
    },
    computed: {
        getDisplayColors() {
            // TODO get fridge settings - max number of users - divide 360/max users. For now assume 20 max users.
            const maxUsers = 20;
            const step = 360 / maxUsers;

            const hues = [];
            for (let i = 0; i < 360; i += step) {
                hues.push(Math.round(i));
            }

            return hues;
        },
        activeHue: {
            get() {
                console.log("here get");
                return this.$store.user.displayColor;
            },
            onTrack(e) {
                console.log("here inactivehue", e);
            },
            onTrigger(e) {
                console.log("here inactivehue", e);
            },
        },
        getName: {
            get() {
                console.log("here getname");
                return this.test;
            },
            onTrack() {
                console.log("here getname track");
            },
            onTrigger() {
                console.log("here in getname trigger");
            },
        },
    },
    methods: {
        setDisplayName() {
            // TODO Validation, better sanitization
            const tempValue = this.localDisplayName.replace(
                /(<([^>]+)>)/gi,
                ""
            );

            this.$refs.displayName.blur();
            this.$store.user.displayName = tempValue;
            this.localDisplayName = "";

            userService
                .updateUser(this.$store.user.id, {
                    displayName: tempValue,
                })
                .then(() => {
                    this.$forceUpdate();
                });
        },
        // setDisplayColor(hue) {
        //     console.log("here");
        //     //this.$store.user.displayColor = hue;
        //     console.log(
        //         "this.$store.user.displayColor",
        //         this.$store.user.displayColor
        //     );

        //     userService
        //         .updateUser(this.$store.user.id, {
        //             displayColor: hue,
        //         })
        //         .then(() => this.$forceUpdate);
        // },
    },
    template: `
        <div>
            <label class="label">
                <p>Display name:</p>
                <input 
                ref="displayName" 
                type="text" 
                @click="localDisplayName = $store.user.displayName" 
                :placeholder="$store.user.displayName" 
                v-model="localDisplayName" 
                @keyup.enter="setDisplayName" 
                autofocus />
                
            </label>

            {{ getName }}  {{test2}}

            <p class="label">Display color:</p>

            <div class="display-color-selector" :key="storeTestColor">
                <div 
                v-for="hue in getDisplayColors" 
                :class="['display-color-option', {'active': hue == storeTestColor}]" 
                :style="'background: hsl(' + hue + 'deg 100% 50%)'"
                @click="storeTestColor = hue"
                > 
                </div>
            </div>
        </div>
    `,
};
