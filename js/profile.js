const btnSave = document.getElementsByClassName('save')[0];

btnSave.addEventListener('click', save);

async function save() {
    const name = document.getElementById('nane').value;
    const psw = document.getElementById('psw').value;
    const pfp = document.getElementById('file').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('psw', psw);
    if (pfp) {
        formData.append('file', pfp);
    }

    try {
        const res = await fetch('http://127.0.0.1:2000/api/update', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await res.json();
        console.log(data);
        
        if (res.ok) {
            alert(data.message);
            window.location.href = '/frontend/home.html';
        } else if (data.errors) {
            let errorMessage = '';
            for (let i = 0; i < data.errors.length; i++) {
                errorMessage += `${data.errors[i].error}\n`;
            }
            alert(errorMessage);
        } else if (data.error) {
            alert(data.error);
        } else {
            alert('Ismeretlen hiba');
        }
    } catch (error) {
        console.error('Hiba történt:', error);
        alert('Hálózati hiba vagy szerverhiba történt.');
    }
}
