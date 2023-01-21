export default {
    props: ["isOpen", "activeLink"],
    inject: ["navigate"],
    template: `
    <div>
        <a href="#" @click.prevent="navigate('root')">Back</a>
        Hello slide
        {{ activeLink.title }}
    </div>
    `,
};
