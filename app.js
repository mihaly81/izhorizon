const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const validator = require('validator');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://127.0.0.1:5502', 'https://izhorizon.netlify.app/'],
    credentials: true
}));

app.use(cookieParser());


// az uploads mappában lévő fájlok elérése
app.use('/foods', express.static(path.join(__dirname, 'foods')));


dotenv.config();
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const uploadDir = 'foods/';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString().split('T')[0];
        cb(null, `${req.user.id}-${now}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Csak képformátumok megengedettek!'));
        }
    }
});

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(403).json({ error: 'Nincs token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Van token, csak épp nem érvényes' });
        }
        req.user = user;
        next();
    });
}

// szerepkör ellenőrzése
app.get('/api/szerepkor', authenticateToken, (req, res) => {
    const user_id = req.user.id;
    console.log(user_id);
    
    const sql = 'SELECT szerepkor FROM users WHERE user_id = ?';

    pool.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log(`szerepkör ellenőrzés: ${err}`);
            return res.status(500).json('Hiba az SQL-ben a szerepkörnél');
        }
        console.log(result);
        
        if (result.szerepkor !== 1) {
            return res.status(404).json({ error: 'Nincs admin jogod', szerepkor });
        }

        return res.status(200).json(szerepkor);
    })
});


// regisztráció
app.post('/api/registration', (req, res) => {
    const { email, psw, name } = req.body;
    const errors = [];
    const pswString = String(psw);

    if (!validator.isEmail(email)) {
        errors.push({ error: 'Nem valós email cím!' });
    }

    if (validator.isEmpty(name)) {
        errors.push({ error: 'Töltsd ki a nevet!' });
    }

    if (!validator.isLength(pswString, { min: 6 })) {
        return res.status(400).json({ error: 'A jelszónak legalább 6 karakternek kell lenni!' });
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    bcrypt.hash(psw, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba a hashelés során' });
        }

        const sql = 'INSERT INTO users(user_id, email, psw, name) VALUES(NULL, ?, ?, ?)';

        pool.query(sql, [email, hash, name], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Az email már foglalt!' });
            }
            res.status(201).json({ message: 'Sikeres regisztráció! ' });
        });
    });
});

// login
app.post('/api/index', (req, res) => {
    const { email, psw } = req.body;
    const errors = [];

    if (!validator.isEmail(email)) {
        errors.push({ error: 'Add meg az email címet ' });
    }

    if (validator.isEmpty(psw)) {
        errors.push({ error: 'Add meg a jelszót' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = 'SELECT * FROM users WHERE email LIKE ?';
    pool.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található' });
        }

        const user = result[0];
        bcrypt.compare(psw, user.psw, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '1y' });

                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({ message: 'Sikeres bejelentkezés' });
            } else {
                return res.status(401).json({ error: 'rossz a jelszó' });
            }
        });
    });
});
// logout
app.post('/api/logout', authenticateToken, (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
    });
    return res.status(200).json({ message: 'Sikeres kijelentkezés!' });
});

// tesztelés a jwt-re
app.get('/api/logintest', authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'bent vagy' });
});

// profile kép megjelenítése
app.get('/api/getpfp', authenticateToken, (req, res) => {
    const user_id = req.user.id;
    console.log(user_id);
    const sql = 'SELECT pfp FROM users WHERE user_id = ?';
    pool.query(sql, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található' });
        }

        return res.status(200).json(result);
    });
});

// profilkép szerkesztése
app.put('/api/editPfp', authenticateToken, upload.single('pfp'), (req, res) => {
    const user_id = req.user.id;
    const pfp = req.file ? req.file.filename : null;
    console.log(user_id);
    const sql = 'UPDATE users SET pfp = COALESCE(NULLIF(?, ""), pfp) WHERE user_id = ?';

    pool.query(sql, [pfp, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        return res.status(200).json({ message: 'Profilkép frissítve' });
    });
});

/*
// admin login

app.post('/api/admin', (req, res) => {
    const { email, psw } = req.body;
    const errors = [];

    if (!validator.isEmail(email)) {
        errors.push({ error: 'Add meg az admin email címet ' });
    }

    if (validator.isEmpty(psw)) {
        errors.push({ error: 'Add meg az admin jelszót' });
    }

    if (szerepkor !== 1) {
        errors.push({ error: 'Hiba: Nincs jogosultságod!' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = 'SELECT * FROM users WHERE email LIKE ?';
    pool.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem találató' });
        }

        const user = result[0];
        if (user.szerepkor !== 1) {
            return res.status(403).json({ error: 'Nincs admin jogosultság!' });
        }

        bcrypt.compare(psw, user.psw, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Hiba a jelszó ellenőrzése során!' });
            }

            if (isMatch) {
                const token = jwt.sign({ id: user.user_id, szerepkor: user.szerepkor }, JWT_SECRET, { expiresIn: '1y' });

                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({ message: 'Sikeres admin bejelentkezés' });
            } else {
                return res.status(401).json({ error: 'Rossz a jelszó' });
            }
        });
    });
});
*/

// profil szerkesztése
app.put('/api/editProfile', authenticateToken, upload.single('pfp'), (req, res) => {
    const { name, psw } = req.body;
    const user_id = req.user.id;
    const pfp = req.file ? req.file.filename : null;
    console.log(user_id);
    if (!validator.isLength(psw, { min: 6 })) {
        return res.status(400).json({ error: 'A jelszónak legalább 6 hosszúnak kell lenni ' });
    }

    console.log(user_id, profile_pic);
    const sql = 'UPDATE users SET name = COALESCE(NULLIF(?, ""), name), psw = COALESCE(NULLIF(?, ""), psw), pfp = COALESCE(NULLIF(?, ""), pfp) WHERE user_id = ?';

    bcrypt.hash(psw, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba a sózáskor! ' });
        }

        pool.query(sql, [name, hash, pfp, user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Hiba az SQL-ben' });
            }

            return res.status(200).json({ message: 'Profil frissítve' });
        });
    });
});

//az összes food lekérdezése képekkel, leírásokkkal, mindennel
app.get('/api/getFoods', authenticateToken, (req, res) => {
    const user_id = req.user.id;
    console.log(user_id);
    const sql = 'SELECT * FROM foods JOIN categories USING(kategoria_id)';

    pool.query(sql, (err, result) => {
        if (err) {
            console.log(`hiba a foods lekérdezésekor: ${err}`);
            return res.status(502).json({ error: `Hiba az SQL-ben` });
        }

        if (result.length === 0) {
            return res.status(404).json('Nincs megjeleníthető étel');
        }

        console.log(result);
        return res.status(200).json(result); 
    });
});
/*
// az összes kép lekérdezése
app.get('/api/images', authenticateToken, (req, res) => {
    const sql = 'SELECT food.food_id, food.kategoria_id, food.img, food.price, food.name, users.pfp';

    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben', err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még kép' });
        }

        return res.status(200).json(result);
    });
});
*/

// Új kép feltöltése
app.post('/api/foods', authenticateToken, upload.single('img'), (req, res) => {
    const img = req.file ? req.file.filename : null;
    const { kategoria_id, price, name, leiras } = req.body;

    // Ellenőrzés, hogy van-e kép
    if (!req.file) {
        return res.status(400).json({ error: 'Válassz ki egy képet' });
    }

    // Ellenőrzés, hogy a szükséges adatok át lettek-e adva
    if (!kategoria_id || !price || !name || !leiras) {
        return res.status(400).json({ error: 'Hiányzó adat(oka)t adtál meg' });
    }

    // Validáció: kategoria_id szám típusú
    if (isNaN(kategoria_id)) {
        return res.status(400).json({ error: 'A kategória ID szám kell hogy legyen' });
    }

    // Validáció: price szám típusú és pozitív szám
    if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ error: 'Az árnak egy pozitív számnak kell lennie' });
    }

    // Validáció: name nem üres
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'A név nem lehet üres' });
    }

    // Validáció: leiras nem üres
    if (typeof leiras !== 'string' || leiras.trim() === '') {
        return res.status(400).json({ error: 'A leírás nem lehet üres' });
    }

    // SQL lekérdezés
    const sql = 'INSERT INTO foods (food_id, kategoria_id, price, img, name, leiras) VALUES (NULL, ?, ?, ?, ?, ?)';

    // SQL lekérdezés futtatása
    pool.query(sql, [kategoria_id, price, img, name, leiras], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        // Sikeres adatfeltöltés válasz
        return res.status(201).json({ message: 'Kép feltöltve', upload_id: result.insertId });
    });
});


// időpont foglalás
app.post('/api/foglalas', authenticateToken, (req, res) => {
    const { datum } = req.body;
    const felhasznalo_id = req.user.id;
    // Ellenőrzés: minden mező ki van e töltve
    if (!datum) {
        return res.status(400).json({ error: 'Minden mezőt ki kell tölteni!' });
    }

    // SQL lekérdezés az adatbázisba történő beszúráshoz
    const sql = 'INSERT INTO foglalasok (foglalas_id, felhasznalo_id, datum) VALUES (NULL, ?, ?)';

    pool.query(sql, [felhasznalo_id, datum], (err, result) => {
        if (err) {
            console.error('SQL hiba:', err);
            return res.status(500).json({ error: 'Hiba történt a foglalás során' });
        }

        return res.status(201).json({
            message: 'Időpont sikeresen lefoglalva',
            foglalas_id: result.insertId
        });
    });
});


app.listen(PORT, () => {
    console.log(`IP: https://${HOSTNAME}:${PORT}`);
});