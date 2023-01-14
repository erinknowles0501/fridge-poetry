import store from "../store.js";
//import { userService } from "../services/api.js";

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
    constructor() {
        this.#createRootEl();
        this.render();
    }

    #createRootEl() {
        this.rootEl = document.createElement("div");
        this.rootEl.className = "user-dropdown";
    }

    shouldDisplay = false;
    setShouldDisplay(newValue) {
        this.shouldDisplay = newValue;
        this.render();
    }

    render() {
        const html = `
            <div class="user-details-wrap">
                <div class="color" style="background: ${store.user.color}"></div>
                <p>
                    <a class="display-name" href="#">
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
    }
}

class UserDropdownUI {
    constructor() {
        this.rootEl = document.querySelector("#user-dropdown-wrap");
        this.toggle = new UserDropdownToggle("user-dropdown-toggle");
        this.dropdown = new UserDropdown(this.rootEl);

        this.toggle.rootEl.addEventListener("click", () => {
            this.toggle.setDisplayName("value");
            this.dropdown.setShouldDisplay(!this.dropdown.shouldDisplay);
        });
    }

    render() {
        this.rootEl.appendChild(this.dropdown.rootEl);
        this.rootEl.appendChild(this.toggle.rootEl);
    }
}

export default new UserDropdownUI();
