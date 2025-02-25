const iconUser = document.getElementsByClassName('icon-user')[0];
const iconLogout = document.getElementsByClassName('icon-logout')[0];
const iconPlus = document.getElementsByClassName('fixed')[0];



window.addEventListener('DOMContentLoaded', getImg);
 
async function getImg() {
    try {
        const res = await fetch('http://127.0.0.1:2000/api/food', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Hiba történt az ételek lekérésekor.');

        const foods = await res.json();
        console.log(foods);
        renderfoods(foods);
    } catch (error) {
        console.error('Hiba!', error);
}


if (iconUser) {
iconUser.addEventListener('click', () => {
    window.location.href = '/frontend/profile.html';
});
}

if (iconLogout) {
iconLogout.addEventListener('click', logout);
}
}


async function fetchUser() {
    try {
        const res = await fetch('http://127.0.0.1:2000/api/users', { credentials: 'include' });

        if (!res.ok) throw new Error('Felhasználói adatok lekérése sikertelen.');

        const data = await res.json();
        document.getElementById('name').innerText = data.name;
    } catch (error) {
        console.error('Hiba!', error);
        document.getElementById('name').innerText = 'Nem vagy bejelentkezve!';
    }
}

fetchUser();
