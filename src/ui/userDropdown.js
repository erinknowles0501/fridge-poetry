import store from "../store.js";
import { userService } from "../services/api.js";
import { SELECTOR_CHARS } from "./consts.js";

class UserDropdownToggle {
    constructor(className) {
        this.#createRootEl(className);
        this.render();
    }

    #createRootEl(className) {
        this.rootEl = document.createElement("div");
        this.rootEl.className = className;
    }

    setDisplayName(newValue) {
        store.user.displayName = newValue;
        this.render();
    }

    updateColor() {
        store.user.color = "purple";
        this.render();
    }

    render() {
        this.rootEl.style.background = store.user.color;
        this.rootEl.innerHTML = store.user.displayName.slice(0, 1);
    }
}

class UserDropdown {
    selectors = {
        displayColor: {
            name: "display-color",
            char: SELECTOR_CHARS.class,
            events: [
                {
                    type: "click",
                    handler: function () {
                        store.user.color = "green";
                        this.mount.render();
                    },
                },
            ],
        },
        displayName: {
            name: "display-name",
            char: SELECTOR_CHARS.class,
            events: [
                {
                    type: "click",
                    handler: async function () {
                        await userService.updateUser("erintest" /* , data */);
                        this.mount.render();
                    },
                },
            ],
        },
    };

    constructor(mount) {
        this.mount = mount;
        this.#createRootEl();
        this.render();
    }

    #createRootEl() {
        this.rootEl = document.createElement("div");
        this.rootEl.className = "user-dropdown";

        // this.rootEl.addEventListener("click", async () => {
        //     // console.log();
        // });
    }

    #addListeners(selectors) {
        for (const key in selectors) {
            const selector = selectors[key];

            selector.el = this.rootEl.querySelector(
                selector.char + selector.name
            );

            selector.events?.forEach((event) => {
                event.handler = event.handler.bind(this);
                selector.el.addEventListener(event.type, event.handler);
            });
        }
    }

    shouldDisplay = false;
    setShouldDisplay(newValue) {
        this.shouldDisplay = newValue;
        this.render();
    }

    render() {
        const html = `
            <div class="user-details-wrap">
                <div class="${this.selectors.displayColor.name}" style="background: ${store.user.color}"></div>
                <p>
                    <a class="${this.selectors.displayName.name}">
                        ${store.user.displayName}
                    </a>
                </p>
            </div>
            <a href="#">My fridges</a>
            <a href="#">My words</a>
            
            <button type="button">Leave fridge</button>
        `;

        this.rootEl.style.display = this.shouldDisplay ? "block" : "none";
        this.rootEl.innerHTML = html;

        // Has to come after adding the html to the root el or there won't be anything to select
        this.#addListeners(this.selectors);
    }
}

class UserDropdownUI {
    constructor() {
        this.rootEl = document.querySelector("#user-dropdown-wrap");
        this.toggle = new UserDropdownToggle("user-dropdown-toggle");
        this.dropdown = new UserDropdown(this);

        this.toggle.rootEl.addEventListener("click", () => {
            this.dropdown.setShouldDisplay(!this.dropdown.shouldDisplay);
        });
    }

    render() {
        this.dropdown.render();
        this.toggle.render();

        this.rootEl.appendChild(this.dropdown.rootEl);
        this.rootEl.appendChild(this.toggle.rootEl);
    }
}

export default UserDropdownUI;
