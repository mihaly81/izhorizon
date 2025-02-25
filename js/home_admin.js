const iconUser = document.getElementsByClassName('icon-user')[0];
const iconLogout = document.getElementsByClassName('icon-logout')[0];
const iconPlus = document.getElementsByClassName('fixed')[0];

window.addEventListener('DOMContentLoaded', getfoods);

iconUser.addEventListener('click', () => {
    window.location.href = '/frontend/profile.html';
});

iconLogout.addEventListener('click', logout);


async function getImg() {
    const res = await fetch('http://127.0.0.1:2000/api/food', {
        method: 'GET',
        credentials: 'include'
    });

    const foods = await res.json();
    console.log(foods);
    renderfoods(foods);
}