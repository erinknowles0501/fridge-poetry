export default {
    computed: {
        colorValue() {
            return `hsl(${this.$store.user.displayColor}deg 100% 50%)`;
        },
    },
    template: `
        <div class="user-color" :style="'background: ' + colorValue"></div>
    `,
};
