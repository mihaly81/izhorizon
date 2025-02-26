const iconUser = document.getElementsByClassName('iconUser')[0];
const iconLogout = document.getElementsByClassName('iconLogout')[0];

iconUser.addEventListener('click', () => {
    window.location.href = '../profile.html';
});

iconLogout.addEventListener('click', logout);


// logout
async function logout() {
    const res = await fetch('http://127.0.0.1:2000/api/logout', {
        method: 'POST',
        credentials: 'include'
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        window.location.href = '../login.html';
    } else {
        alert('Hiba a kijelentkezéskor');
    }
}
