const btnLogin = document.getElementsByClassName('login')[0];
const btnReg = document.getElementsByClassName('reg')[0];
const btnAdmin = document.getElementById('logadmin')[0];

btnLogin.addEventListener('click', () => {
    window.location.href = '/frontend/home.html';
});

btnReg.addEventListener('click', () => {
    window.location.href = '/frontend/registration.html';
});

btnAdmin.addEventListener('click', () => {
    window.location.href= '/frontend/Admin.html';
})