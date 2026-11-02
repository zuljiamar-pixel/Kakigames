/* KakiGames – Spielinhalte
 * Imposter-Wörter: [Wort, Tipp für den Imposter]
 */
window.KG_DATA = {
  imposterCategories: [
    {
      id: 'essen', name: 'Essen & Trinken', emoji: '🍕',
      words: [
        ['Pizza', 'Ofen'], ['Spaghetti', 'Gabel'], ['Döner', 'Spieß'], ['Sushi', 'Reis'],
        ['Pommes', 'Ketchup'], ['Schokolade', 'süß'], ['Popcorn', 'Kino'], ['Burger', 'Brötchen'],
        ['Eis', 'Waffel'], ['Pfannkuchen', 'Frühstück'], ['Erdbeere', 'rot'], ['Banane', 'gelb'],
        ['Käse', 'Löcher'], ['Brezel', 'Bäcker'], ['Kaffee', 'Bohne'], ['Honig', 'Biene'],
        ['Taco', 'Mexiko'], ['Suppe', 'Löffel'], ['Croissant', 'Frankreich'], ['Wassermelone', 'Sommer'],
        ['Gummibärchen', 'bunt'], ['Raclette', 'geschmolzen'], ['Fondue', 'Topf'], ['Lasagne', 'Schichten'],
        ['Ei', 'Huhn'], ['Wassereis', 'Stiel'], ['Nudelsalat', 'Party'], ['Apfelstrudel', 'Österreich']
      ]
    },
    {
      id: 'tiere', name: 'Tiere', emoji: '🐶',
      words: [
        ['Hund', 'Leine'], ['Katze', 'Schnurrhaare'], ['Elefant', 'grau'], ['Giraffe', 'groß'],
        ['Pinguin', 'Eis'], ['Löwe', 'König'], ['Delfin', 'Meer'], ['Hai', 'Flosse'],
        ['Pferd', 'Stall'], ['Kuh', 'Milch'], ['Schwein', 'Bauernhof'], ['Affe', 'klettern'],
        ['Schlange', 'Gift'], ['Krokodil', 'Fluss'], ['Eule', 'Nacht'], ['Biene', 'Blume'],
        ['Schmetterling', 'Flügel'], ['Frosch', 'Teich'], ['Känguru', 'Australien'], ['Panda', 'Bambus'],
        ['Hamster', 'Käfig'], ['Papagei', 'bunt'], ['Igel', 'Stacheln'], ['Schnecke', 'langsam'],
        ['Wal', 'riesig'], ['Spinne', 'Netz'], ['Fuchs', 'schlau'], ['Flamingo', 'rosa']
      ]
    },
    {
      id: 'orte', name: 'Orte', emoji: '🏖️',
      words: [
        ['Strand', 'Sand'], ['Schule', 'lernen'], ['Krankenhaus', 'Notfall'], ['Flughafen', 'Koffer'],
        ['Kino', 'Leinwand'], ['Supermarkt', 'Einkaufswagen'], ['Bahnhof', 'Gleis'], ['Zoo', 'Gehege'],
        ['Bibliothek', 'leise'], ['Schwimmbad', 'nass'], ['Freizeitpark', 'Achterbahn'], ['Restaurant', 'Kellner'],
        ['Fitnessstudio', 'Gewichte'], ['Kirche', 'Glocke'], ['Museum', 'Ausstellung'], ['Campingplatz', 'Zelt'],
        ['Bäckerei', 'früh'], ['Polizeiwache', 'Uniform'], ['Hotel', 'Zimmer'], ['Skigebiet', 'Schnee'],
        ['Wüste', 'heiß'], ['Berggipfel', 'Aussicht'], ['Disco', 'tanzen'], ['Gefängnis', 'Gitter'],
        ['Weltall', 'Sterne'], ['Spielplatz', 'Rutsche'], ['Tankstelle', 'Benzin'], ['Bauernhof', 'Stall']
      ]
    },
    {
      id: 'berufe', name: 'Berufe', emoji: '👩‍🚒',
      words: [
        ['Feuerwehrmann', 'Schlauch'], ['Polizist', 'Blaulicht'], ['Arzt', 'Kittel'], ['Lehrer', 'Tafel'],
        ['Koch', 'Küche'], ['Pilot', 'Cockpit'], ['Bäcker', 'Mehl'], ['Friseur', 'Haare'],
        ['Astronaut', 'Rakete'], ['Tierarzt', 'Haustier'], ['Mechaniker', 'Werkzeug'], ['Bauer', 'Traktor'],
        ['Zahnarzt', 'Bohrer'], ['Pirat', 'Schatz'], ['Youtuber', 'Kamera'], ['Sänger', 'Mikrofon'],
        ['Detektiv', 'Lupe'], ['Zauberer', 'Hut'], ['Gärtner', 'Pflanzen'], ['Postbote', 'Briefe'],
        ['Clown', 'Zirkus'], ['Maler', 'Pinsel'], ['Kellner', 'Tablett'], ['Busfahrer', 'Haltestelle'],
        ['Schauspieler', 'Bühne'], ['Programmierer', 'Computer'], ['Fotograf', 'Blitz'], ['DJ', 'Plattenteller']
      ]
    },
    {
      id: 'sport', name: 'Sport', emoji: '⚽',
      words: [
        ['Fußball', 'Tor'], ['Basketball', 'Korb'], ['Tennis', 'Schläger'], ['Schwimmen', 'Wasser'],
        ['Skifahren', 'Piste'], ['Boxen', 'Handschuhe'], ['Golf', 'Loch'], ['Volleyball', 'Netz'],
        ['Eishockey', 'Halle'], ['Reiten', 'Sattel'], ['Radfahren', 'Helm'], ['Tischtennis', 'Platte'],
        ['Surfen', 'Welle'], ['Klettern', 'Seil'], ['Bowling', 'Kugel'], ['Yoga', 'Matte'],
        ['Karate', 'Gürtel'], ['Marathon', 'Ausdauer'], ['Handball', 'Wurf'], ['Snowboard', 'Brett'],
        ['Darts', 'Pfeil'], ['Formel 1', 'schnell'], ['Skateboard', 'Rampe'], ['Turnen', 'Ringe'],
        ['Badminton', 'leicht'], ['Fechten', 'Maske'], ['Rudern', 'Boot'], ['Sumo', 'schwer']
      ]
    },
    {
      id: 'gegenstaende', name: 'Gegenstände', emoji: '🔦',
      words: [
        ['Handy', 'Akku'], ['Regenschirm', 'nass'], ['Zahnbürste', 'Badezimmer'], ['Brille', 'Augen'],
        ['Schlüssel', 'Tür'], ['Kerze', 'Flamme'], ['Uhr', 'Zeit'], ['Spiegel', 'Reflexion'],
        ['Kopfhörer', 'Musik'], ['Rucksack', 'tragen'], ['Lampe', 'Licht'], ['Kissen', 'weich'],
        ['Fernbedienung', 'Sofa'], ['Schere', 'scharf'], ['Kühlschrank', 'kalt'], ['Staubsauger', 'laut'],
        ['Wecker', 'Morgen'], ['Gitarre', 'Saiten'], ['Luftballon', 'Luft'], ['Kamera', 'Foto'],
        ['Koffer', 'Reise'], ['Hammer', 'Nagel'], ['Teddybär', 'kuscheln'], ['Socke', 'Fuß'],
        ['Tastatur', 'tippen'], ['Toaster', 'Brot'], ['Sonnenbrille', 'Sommer'], ['Würfel', 'Zufall']
      ]
    },
    {
      id: 'laender', name: 'Länder & Städte', emoji: '🌍',
      words: [
        ['Italien', 'Stiefel'], ['Frankreich', 'Baguette'], ['Japan', 'Insel'], ['USA', 'groß'],
        ['Ägypten', 'Wüste'], ['Brasilien', 'Karneval'], ['Australien', 'weit weg'], ['Spanien', 'Paella'],
        ['Schweiz', 'Berge'], ['Deutschland', 'Autobahn'], ['England', 'Tee'], ['China', 'Mauer'],
        ['Mexiko', 'Sombrero'], ['Griechenland', 'Antike'], ['Kanada', 'Ahorn'], ['Indien', 'Gewürze'],
        ['Norwegen', 'Fjord'], ['Türkei', 'Basar'], ['Paris', 'Liebe'], ['New York', 'Wolkenkratzer'],
        ['Rom', 'Geschichte'], ['London', 'Regen'], ['Venedig', 'Wasser'], ['Hawaii', 'Vulkan'],
        ['Antarktis', 'Eis'], ['Dubai', 'Luxus'], ['Holland', 'Tulpen'], ['Las Vegas', 'Casino']
      ]
    },
    {
      id: 'fahrzeuge', name: 'Fahrzeuge', emoji: '🚗',
      words: [
        ['Auto', 'Straße'], ['Fahrrad', 'Pedale'], ['Flugzeug', 'Himmel'], ['Schiff', 'Hafen'],
        ['U-Bahn', 'Tunnel'], ['Hubschrauber', 'Rotor'], ['Motorrad', 'Lederjacke'], ['Traktor', 'Feld'],
        ['Feuerwehrauto', 'rot'], ['Rakete', 'Weltall'], ['Zug', 'Schienen'], ['Bus', 'Fahrplan'],
        ['Taxi', 'gelb'], ['Kran', 'Baustelle'], ['Heißluftballon', 'schweben'], ['Segelboot', 'Wind'],
        ['Krankenwagen', 'Sirene'], ['Roller', 'zwei Räder'], ['Seilbahn', 'Berg'], ['Kinderwagen', 'Baby'],
        ['U-Boot', 'tauchen'], ['Schlitten', 'Schnee'], ['Limousine', 'lang'], ['Wohnmobil', 'Urlaub'],
        ['Einrad', 'Balance'], ['Müllauto', 'stinkt'], ['Gondel', 'Venedig'], ['Kutsche', 'Pferde']
      ]
    },
    {
      id: 'hobbys', name: 'Freizeit & Hobbys', emoji: '🎮',
      words: [
        ['Videospiele', 'Controller'], ['Zeichnen', 'Stift'], ['Kochen', 'Rezept'], ['Lesen', 'Buch'],
        ['Tanzen', 'Musik'], ['Angeln', 'Geduld'], ['Camping', 'Lagerfeuer'], ['Fotografieren', 'Bild'],
        ['Gärtnern', 'Erde'], ['Shoppen', 'Geld'], ['Karaoke', 'singen'], ['Puzzeln', 'Teile'],
        ['Schach', 'Brett'], ['Stricken', 'Wolle'], ['Filmabend', 'Popcorn'], ['Wandern', 'Wald'],
        ['Grillen', 'Sommer'], ['Basteln', 'Kleber'], ['Backen', 'Ofen'], ['Serien schauen', 'Folge'],
        ['Zaubertricks', 'Karten'], ['Brettspiele', 'Würfel'], ['Musik machen', 'Instrument'], ['Tauchen', 'Sauerstoff'],
        ['Joggen', 'Schuhe'], ['Sammeln', 'Album'], ['Drachen steigen', 'Schnur'], ['Picknick', 'Decke']
      ]
    },
    {
      id: 'feste', name: 'Feste & Feiern', emoji: '🎉',
      words: [
        ['Weihnachten', 'Geschenke'], ['Geburtstag', 'Kuchen'], ['Halloween', 'Kostüm'], ['Ostern', 'Frühling'],
        ['Silvester', 'Feuerwerk'], ['Hochzeit', 'Ring'], ['Karneval', 'Verkleidung'], ['Oktoberfest', 'Tracht'],
        ['Valentinstag', 'Herz'], ['Schulabschluss', 'Zeugnis'], ['Pyjamaparty', 'Übernachtung'], ['Grillparty', 'Garten'],
        ['Konzert', 'Bühne'], ['Festival', 'Matsch'], ['Muttertag', 'Blumen'], ['Taufe', 'Baby'],
        ['Weihnachtsmarkt', 'Glühwein'], ['Ostereiersuche', 'verstecken'], ['Kindergeburtstag', 'Spiele'], ['Nikolaus', 'Stiefel'],
        ['Abschlussball', 'Kleid'], ['Poolparty', 'Wasser'], ['Hausparty', 'Nachbarn'], ['Überraschungsparty', 'Geheimnis']
      ]
    },
    {
      id: 'fantasy', name: 'Fantasy & Märchen', emoji: '🧙',
      words: [
        ['Drache', 'Feuer'], ['Einhorn', 'Horn'], ['Hexe', 'Besen'], ['Vampir', 'Blut'],
        ['Zombie', 'langsam'], ['Meerjungfrau', 'Flosse'], ['Ritter', 'Rüstung'], ['Prinzessin', 'Krone'],
        ['Zwerg', 'klein'], ['Riese', 'groß'], ['Geist', 'durchsichtig'], ['Werwolf', 'Vollmond'],
        ['Kobold', 'grün'], ['Zauberstab', 'Magie'], ['Schloss', 'Turm'], ['Schatzkarte', 'X'],
        ['Elfe', 'spitze Ohren'], ['Roboter', 'Metall'], ['Alien', 'UFO'], ['Superheld', 'Umhang'],
        ['Mumie', 'Bandagen'], ['Schneemann', 'Karotte'], ['Weihnachtsmann', 'Bart'], ['Fee', 'Glitzer']
      ]
    }
  ],

  werWuerdeEher: [
    'als Erstes in einer Zombie-Apokalypse sterben?',
    'im Lotto gewinnen und alles in einer Woche ausgeben?',
    'berühmt werden?',
    'auf einer einsamen Insel überleben?',
    'beim Einkaufen das Wichtigste vergessen?',
    'um 3 Uhr nachts noch Pizza bestellen?',
    'bei einem Horrorfilm schreiend wegrennen?',
    'den ganzen Tag im Bett bleiben?',
    'eine Nachricht an die falsche Person schicken?',
    'Präsident werden?',
    'im Urlaub den Flug verpassen?',
    'bei einer Reality-Show mitmachen?',
    'beim Spielen schummeln?',
    'zehn Katzen haben?',
    'als Erstes auf einer Party einschlafen?',
    'mit Fremden im Internet diskutieren?',
    'im Kino laut lachen, wenn sonst keiner lacht?',
    'ein eigenes Unternehmen gründen?',
    'sich in einem Möbelhaus verlaufen?',
    'einen Marathon laufen?',
    'nach einem Tag im Dschungelcamp aufgeben?',
    'Millionär werden?',
    'einen Geburtstag vergessen?',
    'ein Selfie mit einem Promi ergattern?',
    'zu spät zur eigenen Hochzeit kommen?',
    'die ganze Nacht durchtanzen?',
    'beim Kochen den Rauchmelder auslösen?',
    'ein Geheimnis ausplaudern?',
    'ein Haustier nach einem Essen benennen?',
    'in einer Band spielen?',
    'ein Wettessen gewinnen?',
    'auswandern?',
    'als Letztes auf eine Nachricht antworten?',
    'mit Pflanzen reden?',
    'denselben Film zum zehnten Mal schauen?',
    'sich für eine Party komplett übertrieben verkleiden?',
    'einen Ohrwurm den ganzen Tag singen?',
    'einen Weltrekord aufstellen?',
    'vor Freude weinen?',
    'beim Brettspielabend die Nerven verlieren?',
    'ein Buch schreiben?',
    'sich nachts heimlich an den Kühlschrank schleichen?',
    'sich die Haare pink färben?',
    'behaupten, einen Geist gesehen zu haben?',
    'mit dem Handy in der Hand einschlafen?',
    'als Erstes die Party verlassen?',
    'nach dem Weg fragen, statt aufs Handy zu schauen?',
    'über den eigenen Witz am lautesten lachen?',
    'einen Fallschirmsprung wagen?',
    'heimlich die Serie ohne die anderen weiterschauen?',
    'den Schlüssel im Auto einschließen?',
    'einen Tanz-Trend nachmachen?'
  ],

  wahrheit: [
    'Was war dein peinlichster Moment?',
    'Wen aus dieser Runde würdest du auf eine einsame Insel mitnehmen?',
    'Was ist deine schlimmste Angewohnheit?',
    'Hast du schon mal gelogen, um nicht zu einem Treffen zu müssen?',
    'Was ist das Seltsamste, das du je gegessen hast?',
    'Welcher Song ist dein heimlicher Lieblingssong, für den du dich ein bisschen schämst?',
    'Wer war dein erster Schwarm?',
    'Was würdest du mit einer Million machen?',
    'Was ist die größte Lüge, die du je erzählt hast?',
    'Wovor hast du am meisten Angst?',
    'Was ist das Kindischste, das du immer noch machst?',
    'Welche App benutzt du am meisten?',
    'Was hast du zuletzt gegoogelt?',
    'Wenn du einen Tag unsichtbar wärst – was würdest du tun?',
    'Was war dein schlimmstes Date?',
    'Hast du schon mal etwas kaputt gemacht und es niemandem gesagt?',
    'Was ist dein größter Traum?',
    'Welche berühmte Person würdest du gern einmal treffen?',
    'Was ist die beste Eigenschaft der Person links von dir?',
    'Worüber hast du zuletzt geweint?',
    'Was ist dein Guilty Pleasure?',
    'Hast du schon mal bei einer Prüfung geschummelt?',
    'Welche Superkraft hättest du gern – und warum?',
    'Was ist das Mutigste, das du je gemacht hast?',
    'Wem hast du zuletzt eine Nachricht geschrieben?',
    'Was ist das Verrückteste, das du je gemacht hast?',
    'Wer in dieser Runde wird am ehesten berühmt?',
    'Welches Gerücht über dich stimmt eigentlich?',
    'Was würdest du nie im Leben essen?',
    'Mit wem aus der Runde würdest du für einen Tag tauschen?',
    'Was ist das Netteste, das jemand je für dich getan hat?',
    'Welche Gewohnheit von dir würde hier niemand erraten?'
  ],

  pflicht: [
    'Mach 10 Hampelmänner.',
    'Sing den Refrain deines Lieblingssongs.',
    'Sprich bis zu deiner nächsten Runde mit einem Akzent deiner Wahl.',
    'Imitiere jemanden aus der Runde – die anderen müssen raten, wer es ist.',
    'Zeig das letzte Foto in deiner Galerie (du darfst einmal wischen).',
    'Tanze 30 Sekunden lang ohne Musik.',
    'Mach deine beste Tierstimme – die anderen raten das Tier.',
    'Erzähl einen Witz. Wenn keiner lacht: 5 Kniebeugen!',
    'Die Person links von dir sucht dir eine Grimasse aus – halte sie 10 Sekunden.',
    'Sprich wie ein Roboter, bis du wieder dran bist.',
    'Versuch, mit der Zunge deine Nase zu berühren.',
    'Rede 1 Minute über ein Thema, das die Gruppe aussucht.',
    'Mach ein Selfie mit deiner lustigsten Grimasse.',
    'Lies deine zuletzt gesendete Nachricht laut vor.',
    'Balanciere 30 Sekunden lang einen Gegenstand auf dem Kopf.',
    'Mach 5 Liegestütze.',
    'Mach jeder Person in der Runde ein Kompliment.',
    'Sag das Alphabet rückwärts – so weit du kommst.',
    'Halte 20 Sekunden lang eine Planke.',
    'Die Gruppe gibt dir einen neuen Spitznamen, der bis zum Spielende gilt.',
    'Sei ein Nachrichtensprecher und berichte live über diese Runde.',
    'Lauf wie ein Model über den Laufsteg durch den Raum.',
    'Versuch, 15 Sekunden lang nicht zu blinzeln.',
    'Zeichne mit geschlossenen Augen ein Porträt der Person rechts von dir.',
    'Sing „Alle meine Entchen“ wie ein Opernstar.',
    'Erfinde einen Werbespot für einen Gegenstand im Raum.',
    'Schick einer Person deiner Wahl ein lustiges Sprachmemo.',
    'Sprich bis zu deiner nächsten Runde nur in der dritten Person über dich.',
    'Mach eine Zeitlupen-Szene von einem Torjubel.',
    'Erzähl eine Geschichte, in der jedes Wort mit demselben Buchstaben beginnt.',
    'Lass dir von der Gruppe eine Frisur machen (mit den Händen!).',
    'Stell pantomimisch einen Film dar – die anderen raten.'
  ],

  ichHabNochNie: [
    'einen Flug verpasst.',
    'im Kino geweint.',
    'eine ganze Pizza allein gegessen.',
    'eine Nachricht an die falsche Person geschickt.',
    'mich in einer fremden Stadt verlaufen.',
    'eine Nacht komplett durchgemacht.',
    'einen Promi getroffen.',
    'ein Handy-Display zerbrochen.',
    'auf einer Bühne gestanden.',
    'beim Spielen geschummelt.',
    'Sushi gegessen.',
    'mir einen Knochen gebrochen.',
    'einen ganzen Tag im Pyjama verbracht.',
    'Karaoke gesungen.',
    'einen Geburtstag vergessen.',
    'beim Lügen erwischt worden.',
    'meinen eigenen Namen gegoogelt.',
    'in der Öffentlichkeit gestolpert.',
    'ein Geschenk weiterverschenkt.',
    'eine ganze Serie an einem Wochenende geschaut.',
    'im Unterricht eingeschlafen.',
    'einen Schneemann gebaut.',
    'mir die Haare selbst geschnitten.',
    'eine Sprachnachricht über 5 Minuten verschickt.',
    'so getan, als würde ich telefonieren, um jemandem auszuweichen.',
    'Essen vom Boden aufgehoben und trotzdem gegessen.',
    'ein Instrument gelernt.',
    'an einer Tür gezogen, auf der „Drücken“ stand.',
    'eine Pflanze vertrocknen lassen.',
    'jemandem zurückgewunken, der gar nicht mich gemeint hat.',
    'einen Liebesbrief geschrieben.',
    'Achterbahn gefahren.',
    'einen Film mittendrin verlassen.',
    'ein Tier aus Not gerettet.',
    'mich als jemand anderes ausgegeben.',
    'den Schlüssel von innen stecken lassen und mich ausgesperrt.',
    'einen Wecker 10-mal auf Schlummern gestellt.',
    'nachts heimlich Süßes gegessen.',
    'ein Selfie mit einem Tier gemacht.',
    'beim Videocall vergessen, dass die Kamera an ist.'
  ]
};
