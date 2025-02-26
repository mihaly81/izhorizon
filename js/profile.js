const iconLogout = document.getElementsByClassName('icon-logout')[0];
const btnUpload = document.getElementsByClassName('edit-button')[0];
const btnPic = document.getElementsByClassName('edit-pic')[0];

window.addEventListener('DOMContentLoaded', getpfp);

btnUpload.addEventListener('click', editpfp);

// a profile kép megjelenítése
async function getpfp() {
    const res = await fetch('http://127.0.0.1:2000/api/getpfp', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();
    console.log(data);
    
    if (res.ok) {
        btnPic.style.backgroundImage = `url('http://127.0.0.1:2000/users/${data[0].pfp}')`;
    }
}

//profile name szerkesztése
async function editpfp() {
    const name = document.getElementById('name').value;
    
    const res = await fetch('http://127.0.0.1:2000/api/editPfp', {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        }, 
        body: JSON.stringify({ name }),
        credentials: 'include'
    });

    const data = await res.json();
    console.log(data);
    
    if (res.ok) {
        alert(data.message);
        window.location.href = '../profile.html';
    } else {
        alert(data.error);
    }
}