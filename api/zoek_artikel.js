const fetch = require('node-fetch');

// Vercel Node.js API Functions gebruiken een stream — je moet de body zelf uitlezen
module.exports = async (req, res) => {
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const rawBody = Buffer.concat(buffers).toString();
    const body = JSON.parse(rawBody);

    const { artikelnummer } = body;

    if (!artikelnummer) {
      return res.status(400).json({ error: 'Artikelnummer ontbreekt.' });
    }

    const txtUrl = 'https://raw.githubusercontent.com/chatgptpython/horeca/main/data/resultaten.txt';

    const response = await fetch(txtUrl);
    const data = await response.text();
    const lines = data.split('\n');

    const target = `artikelnummer: ${artikelnummer}`.toLowerCase().trim();

    const match = lines.find(line =>
      line.toLowerCase().includes(target)
    );

    if (!match) {
      return res.status(404).json({ error: `Artikelnummer ${artikelnummer} niet gevonden.` });
    }

    const result = match.split(' | ').reduce((acc, pair) => {
      const [key, value] = pair.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'Fout bij verwerken van het verzoek',
      details: err.message
    });
  }
};
