import express from "express";
import axios from "axios";

const router = express.Router();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  console.warn(
    "⚠️ Falta TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET en el .env. IGDB no funcionará."
  );
}

let igdbToken = null;
let igdbTokenExpiresAt = 0;

async function getIgdbToken() {
  const now = Date.now();

  if (igdbToken && now < igdbTokenExpiresAt - 60_000) {
    return igdbToken;
  }

  const url = "https://id.twitch.tv/oauth2/token";

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const { data } = await axios.post(url, params);

  igdbToken = data.access_token;
  igdbTokenExpiresAt = now + data.expires_in * 1000;

  console.log("🔑 Nuevo token de IGDB obtenido");
  return igdbToken;
}

let lastCallTimestamp = 0;
const MIN_INTERVAL_MS = 1500;

router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1 } = req.query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;

    const now = Date.now();
    const diff = now - lastCallTimestamp;

    if (diff < MIN_INTERVAL_MS) {
      const waitMs = MIN_INTERVAL_MS - diff;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    lastCallTimestamp = Date.now();

    const token = await getIgdbToken();

    const bodyParts = [];
    bodyParts.push("fields name, first_release_date, rating, cover.image_id;");
    if (search) {
      bodyParts.push(`search "${search}";`);
    } else {
      bodyParts.push("sort rating desc;");
    }
    bodyParts.push(`limit ${limit};`);
    bodyParts.push(`offset ${offset};`);

    const queryBody = bodyParts.join(" ");

    const { data: igdbGames } = await axios.post(
      "https://api.igdb.com/v4/games",
      queryBody,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const results = igdbGames.map((game) => {
      const releaseYear = game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null;

      const coverImage = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null;

      return {
        id: game.id,
        name: game.name,
        coverImage,
        releaseYear,
        rating: game.rating || 0,
      };
    });

    return res.json({ results });
  } catch (error) {
    console.error(
      "Error al obtener juegos desde IGDB:",
      error.response?.data || error.message
    );

    return res
      .status(500)
      .json({ message: "Error al obtener juegos externos desde IGDB." });
  }
});

export default router;
