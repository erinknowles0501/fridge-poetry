import UserSettings from "./user/UserSettings.js";

export default {
    props: ["isOpen", "activeLink"],
    inject: ["navigate"],
    components: { UserSettings },
    template: `
    <div>
        <div class="menu-title-wrap">
            <a href="#" @click.prevent="navigate('root')" class="back">&lt;</a>
            <h3 class="menu-title">{{ activeLink.title }}</h3>
        </div>
        <component :is="activeLink.componentName" :activeLink="activeLink" />
    </div>
    `,
};
