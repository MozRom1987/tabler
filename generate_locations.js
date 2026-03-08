const fs = require('fs');
const path = require('path');

const locations = {
    przemysl: {
        name: 'Przemyśl',
        locative: 'Przemyślu',
        villages: 'Bełwin, Grochowce, Hermanowice, Hołubla, Krowniki, Kruhel Mały, Kruhel Wielki, Kuńkowce, Łętownia, Łuczyce, Malhowice, Nehrybka, Pikulice, Rożubowice, Stanisławczyk, Ujkowice, Wapowce, Witoszyńce, Żurawica, Baraki, Batycze, Bolestraszyce, Buszkowice, Buszkowiczki, Kosienice, Maćkowice, Orzechowce, Wyszatyce, Medyka, Hureczko, Hurko, Jaksmanice, Siedliska, Torki, Krasiczyn, Prałkowce, Śliwnica, Zamoście'
    },
    jaroslaw: {
        name: 'Jarosław',
        locative: 'Jarosławiu',
        villages: 'Koniaczów, Kostków, Makowisko, Munina, Pełkinie, Sobiecin, Surochów, Tuczempy, Wietlin, Wietlin Pierwszy, Wietlin Trzeci, Zgoda, Pawłosiów, Cieszacin Mały, Cieszacin Wielki, Kidałowice, Tywonia, Wierzbna, Chłopice, Boratyn, Dobkowice, Jankowice, Łowce, Zamiechów, Szówsko, Wiązownica'
    },
    radymno: {
        name: 'Radymno',
        locative: 'Radymnie',
        villages: 'Chałupki Chotynieckie, Chotyniec, Duńkowice, Grabowiec, Korczowa, Łazy, Michałówka, Młyny, Nienowice, Ostrów, Piaski, Skołoszów, Sośnica, Święte, Zabłotce, Zamojsce, Orły, Drohojów, Hnatkowice, Kaszyce, Małkowice, Olszany, Pantalowice, Trójczyce, Wacławice, Walawa, Stubno, Barycz, Kalników, Nakło, Starzawa, Pozdiacz (Leszno)'
    },
    pruchnik: {
        name: 'Pruchnik',
        locative: 'Pruchniku',
        villages: 'Pruchnik Dolny, Pruchnik Górny, Hawłowice, Jodłówka, Kramarzówka, Rozbórz Długi, Rozbórz Okrągły, Rzeplin, Świebodna, Roźwienica, Bystrowice, Chorzów, Czudowice, Rudołowice, Tyniowice, Węgierka, Wola Roźwienicka'
    },
    bircza: {
        name: 'Bircza',
        locative: 'Birczy',
        villages: 'Boguszówka, Borownica, Brzeżawa, Dobrzanka, Grodzisko, Jawornik Ruski, Korzeniec, Kotów, Kuźmina, Leszczawa Dolna, Leszczawa Górna, Lipa, Łodzinka Dolna, Łodzinka Górna, Malawa, Nowa Wieś, Roztoka, Rudawka, Stara Bircza, Sufczyna, Wola Korzeniecka, Żohatyn, Fredropol, Aksmanice, Darowice, Huwniki, Kalwaria Pacławska, Kłokowice, Kniażyce, Koniusza, Kupiatycze, Młodowice, Nowe Sady, Pacław, Rybotycze, Sierakośce'
    },
    dubiecko: {
        name: 'Dubiecko',
        locative: 'Dubiecku',
        villages: 'Drohobyczka, Hucisko Nienadowskie, Iskań, Nienadowa, Piątkowa, Przedmieście Dubieckie, Sielnica, Śliwnica, Winne-Podbukowina, Wybrzeże, Krzywcza, Babice, Bachów, Chyrzyna, Kupna, Reczpol, Ruszelczyce, Skopów, Średnia'
    }
};

const src = './src';

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    const files = fs.readdirSync(src);
    for (const file of files) {
        if (fs.statSync(path.join(src, file)).isFile() && file.endsWith('.njk')) {
            fs.copyFileSync(path.join(src, file), path.join(dest, file));
        }
    }
}

for (const [folderId, dict] of Object.entries(locations)) {
    const folderPath = path.join(src, folderId);

    // create if not exist by copying jaroslaw
    if (!fs.existsSync(folderPath)) {
        copyDir(path.join(src, 'jaroslaw'), folderPath);
        console.log(`Created ${folderId}`);
    }

    // update njk files
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        if (file.endsWith('.njk')) {
            let content = fs.readFileSync(path.join(folderPath, file), 'utf8');
            content = content.replace(/city_name: "(.*?)"/, `city_name: "${dict.name}"`);
            content = content.replace(/city_locative: "(.*?)"/, `city_locative: "${dict.locative}"`);
            content = content.replace(/city_path: "(.*?)"/, `city_path: "/${folderId}/"`);

            // For index.njk, update villages and title/seo_desc specifically to match the correct city name
            if (file === 'index.njk') {
                // Check if villages exists, if not add it
                if (content.includes('villages:')) {
                    content = content.replace(/villages: "(.*?)"/, `villages: "${dict.villages}"`);
                } else {
                    content = content.replace('---', `---\nvillages: "${dict.villages}"`);
                }

                content = content.replace(/title: "Naprawa AGD [^ ]+/, `title: "Naprawa AGD ${dict.name}`);
                content = content.replace(/seo_desc: "Szybka i skuteczna naprawa sprzętu AGD w [^ ]+/, `seo_desc: "Szybka i skuteczna naprawa sprzętu AGD w ${dict.locative}`);
            } else {
                // For subpages, replace the title "Naprawa ... Jarosław "
                content = content.replace(/title: "(Naprawa .*) (Jarosław|Przemyśl|Radymno|Pruchnik|Bircza|Dubiecko)/, `title: "$1 ${dict.name}`);
            }

            fs.writeFileSync(path.join(folderPath, file), content);
            console.log(`Updated ${folderPath}/${file}`);
        }
    }
}
