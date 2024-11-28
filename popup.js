// Funktion zur Aktualisierung der Restlaufzeit und des Endzeitpunkts des YouTube-Videos
function updateRemainingTime() {
  // Abfrage nach aktiven Tabs im aktuellen Fenster
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || tabs.length === 0) {
      console.error("Kein aktiver Tab gefunden.");
      return;
    }
    
    const currentTab = tabs[0];

    // Überprüfen, ob eine YT-Video-URL geladen ist
    if (currentTab.url.includes("youtube.com") && currentTab.url.includes("/watch")) {
      // Nachricht an das Inhalts-Skript senden, um Videoinformationen zu erhalten
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "getVideoInfo" },
        function (response) {
          console.log("Antwort erhalten:", response);  // Logge empfangene Antworten
          // Überprüfen, ob eine gültige Antwort erhalten wurde
          if (response) {
            const playPauseIcon = document.getElementById("playPauseIcon");
            const remainingTime = document.getElementById("remainingTime");
            const endTime = document.getElementById("endTime");
            const videoTitle = document.getElementById("videoTitle");

            if (response.isLiveStream) {
              // Livestream-Fall
              videoTitle.innerText = response.title;  // Zeige den Titel des Livestreams an
              remainingTime.innerText = "Livestream wird " + (response.isPaused ? "pausiert" : "abgespielt");
              playPauseIcon.innerText = response.isPaused ? "⏸️" : "▶️"; // Pausensymbol oder Playsymbol
              endTime.innerText = "";  // Kein Endzeitpunkt für Livestreams
            } else {
              // Normales Video
              videoTitle.innerText = response.title;  // Zeige den Videotitel an
              remainingTime.innerText = "Restlaufzeit: " + response.remainingTime;
              endTime.innerText = "Endzeit: " + response.endTime + " Uhr";
              playPauseIcon.innerText = response.isPaused ? "⏸️" : "▶️"; // Pausensymbol oder Playsymbol
            }
          } else {
            // Anzeigen einer Meldung, wenn keine gültigen Daten vorhanden sind
            document.getElementById("remainingTime").innerText = "Werte werden nicht angezeigt, Seite bitte neu laden.";
            document.getElementById("endTime").innerText = "";
            document.getElementById("playPauseIcon").innerText = ""; // Leert das Symbol, falls vorhanden
            document.getElementById("videoTitle").innerText = "";
            console.error("Keine gültige Antwort erhalten.");
          }
        }
      );
    }
  });
}

// Initiale Aktualisierungen beim Laden des Popups
updateRemainingTime();

// Regelmäßige Aktualisierung alle halbe Sekunde
setInterval(updateRemainingTime, 500);  // Zeitintervall erhöht

// Fehlerbehandlung hinzufügen
setTimeout(() => {
  if (!document.getElementById("remainingTime").innerText) {
    document.getElementById("remainingTime").innerText = "Werte werden nicht angezeigt, Seite bitte neu laden.";
  }
}, 2000);  // Nach 2 Sekunden überprüfen, ob eine Antwort kam