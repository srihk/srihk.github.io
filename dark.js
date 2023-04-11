const toggle = document.querySelector(".dark-toggle");
const theme = localStorage.getItem("theme");
const body = document.querySelector("body");

const Theme = {
    DARK: "dark",
    LIGHT: "light"
};

if (theme === Theme.DARK) {
    if (!body.classList.contains(Theme.DARK)) {
        body.classList.add(Theme.DARK);
    }
}

toggle.addEventListener("click", (event) => {
    if (body.classList.toggle(Theme.DARK)) {
        localStorage.setItem("theme", Theme.DARK);
    }
    else {
        localStorage.setItem("theme", Theme.LIGHT);
    }
});
