const fs = require('fs');
const path = require('path');

// All city subpages that need the villages variable added
const cityData = {
    'jaroslaw': {
        villages: 'Koniaczów, Kostków, Makowisko, Munina, Pełkinie, Sobiecin, Surochów, Tuczempy, Wietlin, Wietlin Pierwszy, Wietlin Trzeci, Zgoda, Pawłosiów, Cieszacin Mały, Cieszacin Wielki, Kidałowice, Tywonia, Wierzbna, Chłopice, Boratyn, Dobkowice, Jankowice, Łowce, Zamiechów, Szówsko, Wiązownica'
    },
    'radymno': {
        villages: 'Chałupki Chotynieckie, Chotyniec, Duńkowice, Grabowiec, Korczowa, Łazy, Michałówka, Młyny, Nienowice, Ostrów, Piaski, Skołoszów, Sośnica, Święte, Zabłotce, Zamojsce, Orły, Drohojów, Hnatkowice, Kaszyce, Małkowice, Olszany, Pantalowice, Trójczyce, Wacławice, Walawa, Stubno, Barycz, Kalników, Nakło, Starzawa, Pozdiacz (Leszno)'
    },
    'pruchnik': {
        villages: 'Pruchnik Dolny, Pruchnik Górny, Hawłowice, Jodłówka, Kramarzówka, Rozbórz Długi, Rozbórz Okrągły, Rzeplin, Świebodna, Roźwienica, Bystrowice, Chorzów, Czudowice, Rudołowice, Tyniowice, Węgierka, Wola Roźwienicka'
    },
    'bircza': {
        villages: 'Boguszówka, Borownica, Brzeżawa, Dobrzanka, Grodzisko, Jawornik Ruski, Korzeniec, Kotów, Kuźmina, Leszczawa Dolna, Leszczawa Górna, Lipa, Łodzinka Dolna, Łodzinka Górna, Malawa, Nowa Wieś, Roztoka, Rudawka, Stara Bircza, Sufczyna, Wola Korzeniecka, Żohatyn, Fredropol, Aksmanice, Darowice, Huwniki, Kalwaria Pacławska, Kłokowice, Kniażyce, Koniusza, Kupiatycze, Młodowice, Nowe Sady, Pacław, Rybotycze, Sierakośce'
    },
    'dubiecko': {
        villages: 'Drohobyczka, Hucisko Nienadowskie, Iskań, Nienadowa, Piątkowa, Przedmieście Dubieckie, Sielnica, Śliwnica, Winne-Podbukowina, Wybrzeże, Krzywcza, Babice, Bachów, Chyrzyna, Kupna, Reczpol, Ruszelczyce, Skopów, Średnia'
    },
    'przemysl': {
        villages: 'Bełwin, Grochowce, Hermanowice, Hołubla, Krowniki, Kruhel Mały, Kruhel Wielki, Kuńkowce, Łętownia, Łuczyce, Malhowice, Nehrybka, Pikulice, Rożubowice, Stanisławczyk, Ujkowice, Wapowce, Witoszyńce, Żurawica, Baraki, Batycze, Bolestraszyce, Buszkowice, Buszkowiczki, Kosienice, Maćkowice, Orzechowce, Wyszatyce, Medyka, Hureczko, Hurko, Jaksmanice, Siedliska, Torki, Krasiczyn, Prałkowce, Śliwnica, Zamoście'
    }
};

const services = ['naprawa_pralek', 'naprawa_lodowek', 'naprawa_zmywarek', 'naprawa_piekarnikow'];

let fixed = 0;
for (const [city, data] of Object.entries(cityData)) {
    for (const service of services) {
        const filePath = path.join('src', city, `${service}.njk`);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');

        // Check if villages is missing
        if (!content.includes('villages:')) {
            // Add villages after city_path line
            content = content.replace(
                /city_path: "([^"]+)"\n---/,
                `city_path: "$1"\nvillages: "${data.villages}"\n---`
            );
            // Also handle \r\n line endings
            content = content.replace(
                /city_path: "([^"]+)"\r\n---/,
                `city_path: "$1"\r\nvillages: "${data.villages}"\r\n---`
            );
            fs.writeFileSync(filePath, content);
            console.log(`Fixed: ${filePath}`);
            fixed++;
        }
    }
}
console.log(`\nDone! Fixed ${fixed} files.`);
