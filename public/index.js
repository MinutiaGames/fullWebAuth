const stateChange = setInterval(() => {
    if (document.readyState == 'complete'){
        clearInterval(stateChange);
        main();
    }
}, 100);

const $ = function(elem) {
    return document.querySelector(elem);
}

function main() {

    const navButton = $('#mobile-nav-menu-button');
    const mobileNavManu = $('#mobile-nav-menu');
    const navCloseButton = $('#nav-close-button');
    const loginButton = $('#login-button');

    navButton.addEventListener('click', () => {
        mobileNavManu.classList.add('mobile-nav-menu-open');
    });

    navCloseButton.addEventListener('click', () => {
        mobileNavManu.classList.remove('mobile-nav-menu-open');
    });

    loginButton.addEventListener('click', () => {
        const loginWindow = $('.login-wrap')

        loginWindow.classList.toggle('hidden');
    });

}