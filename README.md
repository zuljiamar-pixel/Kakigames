# 🍊 KakiGames

**Partyspiele für dich & deine Freunde – alles auf einem Handy.**

KakiGames ist eine Web-App (PWA) im Stil von Party-Apps wie Splash: Spiel auswählen, Spieler eintragen, Handy reihum weitergeben – fertig. Sie läuft im Browser auf jedem Handy, lässt sich wie eine echte App auf den Homescreen legen und funktioniert danach auch **offline**.

## Spiele

| Spiel | Spieler | So geht's |
|---|---|---|
| 🕵️ **Imposter** | 3–20 | Alle bekommen dasselbe geheime Wort – nur der Imposter nicht. Reihum sagt jeder ein passendes Wort, dann wird abgestimmt: Wer ist der Imposter? |
| 👉 **Wer würde eher?** | 3+ | Karte vorlesen, auf drei zeigen alle auf die Person, die am ehesten passt. |
| 🎲 **Wahrheit oder Pflicht** | 2–20 | Die App sagt, wer dran ist. Wahrheit oder Pflicht wählen (oder den Zufall entscheiden lassen). |
| 🙈 **Ich hab noch nie …** | 2+ | Karte vorlesen – wer es schon mal gemacht hat, hebt die Hand und erzählt. |

### Imposter – Einstellungen

- **Spieler:** Namen eintragen. Das Handy wird in dieser Reihenfolge weitergegeben; die Namen bleiben gespeichert.
- **Tipp für den Imposter:**
  - 🚫 *Kein Tipp*: Der Imposter weiß nur, dass er der Imposter ist.
  - 📂 *Kategorie*: Der Imposter sieht die Kategorie (z. B. „Tiere“).
  - 💡 *Hinweis*: Der Imposter bekommt ein passendes Hinweiswort (z. B. „Leine“ bei „Hund“).
- **Kategorien:** 11 Kategorien mit 300 Wörtern, z. B. Essen, Tiere, Orte, Berufe, Sport, Länder, Fantasy …
- **Eigene Wörter:** eigene Begriffe eintragen, ein Wort pro Zeile, optional mit Tipp: `Wort: Tipp`
- **Anzahl Imposter:** 1 bis maximal knapp die Hälfte der Spieler.
- **Diskussions-Timer:** Aus, 1, 2, 3 oder 5 Minuten (mit Ton und Vibration am Ende).

**Ablauf einer Runde:** Handy an Spieler 1 → Karte antippen und Rolle anschauen → „Verstecken & weitergeben“ → … → die App sagt, wer anfängt → Diskussion (optional mit Timer) → Abstimmung mit dramatischer Auflösung 🎉 → neue Runde mit neuem Wort (Wörter wiederholen sich nicht so schnell).

## App aufs Handy bringen

Die App braucht keinen Server, nur statisches Hosting. Am einfachsten mit **GitHub Pages**:

1. Im Repo auf GitHub: **Settings → Pages**
2. Bei *Source* **„Deploy from a branch“** wählen, dann den Branch und den Ordner **`/ (root)`** auswählen → **Save**
3. Nach ca. 1 Minute ist die App unter `https://<dein-name>.github.io/Kakigames/` erreichbar.

Dann auf dem Handy öffnen und als App installieren:

- **iPhone (Safari):** Teilen-Symbol ⬆︎ → **„Zum Home-Bildschirm“**
- **Android (Chrome):** Auf dem Startbildschirm der App auf **„Installieren“** tippen, oder Menü ⋮ → **„App installieren“**

## Lokal starten

```bash
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```

## Projektaufbau

```
index.html             Einstiegsseite
css/style.css          Design (Farben, Karten, Animationen)
js/data.js             Alle Inhalte: Imposter-Wörter & Tipps, Fragen & Aufgaben
js/app.js              App-Logik: Startbildschirm, Spielerverwaltung, alle Spiele
sw.js                  Service Worker für den Offline-Modus
manifest.webmanifest   App-Infos für den Homescreen
icons/                 App-Icons
```

**Neue Wörter oder Fragen hinzufügen:** einfach `js/data.js` bearbeiten. Nach Änderungen an Dateien die Versionsnummer `CACHE` in `sw.js` erhöhen (z. B. `kakigames-v2`), damit installierte Apps das Update sicher bekommen.
