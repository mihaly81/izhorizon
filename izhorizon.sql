-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Már 05. 10:43
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `izhorizon`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `kategoria_id` int(11) NOT NULL,
  `nev` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`kategoria_id`, `nev`) VALUES
(1, 'Eloetelek');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foglalasok`
--

CREATE TABLE `foglalasok` (
  `foglalas_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foods`
--

CREATE TABLE `foods` (
  `food_id` int(11) NOT NULL,
  `kategoria_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `img` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `leiras` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `foods`
--

INSERT INTO `foods` (`food_id`, `kategoria_id`, `price`, `img`, `name`, `leiras`) VALUES
(1, 1, 500.00, 'zoldsegtal.jpg', 'zoldsegtal', 'zöldség');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `uploads`
--

CREATE TABLE `uploads` (
  `upload_id` int(10) UNSIGNED NOT NULL,
  `images` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `psw` varchar(255) NOT NULL,
  `szerepkor` tinyint(1) NOT NULL,
  `pfp` varchar(50) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`user_id`, `email`, `psw`, `szerepkor`, `pfp`, `name`) VALUES
(2, 'masodik@gmail.com', '$2b$10$DPT.lZejUmgxGog8u6enBehiSW4kS1zyUMnR9e5uP/gRscyQJZP.e', 0, '', 'masodik'),
(4, 'elso@gmail.com', '$2b$10$T3e70U1ZAWMVSc6/3BZFIOAD2drjEbrPNnGtoidKCdBMGxoNKnEuy', 0, '', 'elso'),
(5, 'niki@gmail.com', '$2b$10$iGk01ZKmyV1.u.4O0XZGGeQpi8vno8fJ3w8xVlTGD6oRV9aR0WU/C', 1, '', 'Niki'),
(6, 'misi@gmail.com', '$2b$10$PYUkOxIHobDnHfF0x2oBXeSa5j4MLUPd2BFHVY3n9S/VDq7/ThYpO', 1, '', 'misi'),
(7, 'hello@gmail.com', '$2b$10$0EmsQajTtiPZNjhyTeilD.70GfZ0XFTO.e7P/EjW6BO8.KRP3/ekC', 0, '', 'hello'),
(8, '1@1.com', '$2b$10$P2MVXdMrAF07o4Kr3F40fupo9quO.juQkZ5hy.2NNFTBkafOvcgOK', 0, '', 'őpk'),
(9, 'teszt@teszt.com', '$2b$10$BFrUcP5QDJ332XoqGHKHp.Y9LxKN6jq/RObCY6DmpjT65fAjpdbSm', 0, '', 'asdpaspdasd');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `velemenyek`
--

CREATE TABLE `velemenyek` (
  `velemeny_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `velemeny` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`kategoria_id`);

--
-- A tábla indexei `foglalasok`
--
ALTER TABLE `foglalasok`
  ADD PRIMARY KEY (`foglalas_id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- A tábla indexei `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`food_id`),
  ADD KEY `kategoria_id` (`kategoria_id`);

--
-- A tábla indexei `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`upload_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `velemenyek`
--
ALTER TABLE `velemenyek`
  ADD PRIMARY KEY (`velemeny_id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `kategoria_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `foglalasok`
--
ALTER TABLE `foglalasok`
  MODIFY `foglalas_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `foods`
--
ALTER TABLE `foods`
  MODIFY `food_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `uploads`
--
ALTER TABLE `uploads`
  MODIFY `upload_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `velemenyek`
--
ALTER TABLE `velemenyek`
  MODIFY `velemeny_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`kategoria_id`) REFERENCES `foods` (`kategoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `foglalasok`
--
ALTER TABLE `foglalasok`
  ADD CONSTRAINT `foglalasok_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `velemenyek`
--
ALTER TABLE `velemenyek`
  ADD CONSTRAINT `velemenyek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
