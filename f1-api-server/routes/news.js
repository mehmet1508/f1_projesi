const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'], // Resimleri çekmek için
            ['enclosure', 'image'],      // Alternatif resim alanı
        ]
    }
});

// Haber Kaynakları (İstersen buraya Autosport vb. ekleyebilirsin)
const FEED_URL = 'https://tr.motorsport.com/rss/f1/news/';

router.get('/', async (req, res) => {
    try {
        const feed = await parser.parseURL(FEED_URL);

        // Veriyi temizleyip Frontend'in anlayacağı formata sokalım
        const newsList = feed.items.map(item => {
            // Resim bulma mantığı (RSS'te resimler farklı yerlerde olabilir)
            let imageUrl = 'https://cdn-1.motorsport.com/static/img/mgl/900000/990000/995000/995500/995589/s8/f1-abu-dhabi-gp-2020-yas-marina-circuit-general-view.jpg'; // Varsayılan resim

            if (item.media && item.media.$ && item.media.$.url) {
                imageUrl = item.media.$.url;
            } else if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
            } else if (item.content && item.content.match(/src="([^"]*)"/)) {
                // İçerikte img tag'i varsa regex ile al
                imageUrl = item.content.match(/src="([^"]*)"/)[1];
            }

            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item.contentSnippet || item.content, // Kısa özet
                image: imageUrl,
                source: "Motorsport TR"
            };
        });

        // İlk 12 haberi gönder
        res.json(newsList.slice(0, 12));

    } catch (error) {
        console.error("RSS Hatası:", error);
        res.status(500).json({ message: "Haberler çekilemedi." });
    }
});

module.exports = router;