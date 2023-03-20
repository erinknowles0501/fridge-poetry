export default {
    inject: ["store"],
    props: { activeLink: { required: true, type: Object } },
    data() {
        return {
            localDisplayName: "",
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
    },
    methods: {
        setDisplayName() {
            // TODO Validation, better sanitization
            const tempValue = this.localDisplayName.replace(
                /(<([^>]+)>)/gi,
                ""
            );

            this.$refs.displayName.blur();
            this.store.user.displayName = tempValue;
            this.localDisplayName = "";
        },
    },
    template: `
        <div>
            <label class="label">
                <p>Display name:</p>
                <input 
                ref="displayName" 
                type="text" 
                @click="localDisplayName = store.user.displayName" 
                :placeholder="store.user.displayName" 
                v-model="localDisplayName" 
                @keyup.enter="setDisplayName" 
                autofocus />
                
            </label>

            <p class="label">Display color:</p>

            <div class="display-color-selector">
                <div 
                v-for="hue in getDisplayColors" 
                :class="['display-color-option', {'active': hue == store.user.displayColor}]" 
                :style="'background: hsl(' + hue + 'deg 100% 50%)'"
                @click="store.user.displayColor = hue"
                > 
                </div>
            </div>
        </div>
    `,
};
