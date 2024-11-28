let hasCheckedForLivestream = false;
let isLiveStream = false;

// Funktion zum Erstellen oder Aktualisieren des Info-Elements
const updateInfoElement = (remainingTime, endTime) => {
  // Überprüfe, ob es sich um einen Livestream handelt
  if (isLiveStream) {
    console.log("Livestream erkannt, HTML-Element wird nicht hinzugefügt.");
    return;  // Beende die Funktion, wenn es ein Livestream ist
  }

  let infoElement = document.getElementById("video-info-element");

  // Wenn das Element nicht existiert, erstelle es
  if (!infoElement) {
    infoElement = document.createElement("div");
    infoElement.id = "video-info-element";
    infoElement.style.marginTop = "1px";
    infoElement.style.fontSize = "14px";
    infoElement.style.color = "#FFFF";
    infoElement.style.cursor = "pointer";

    const titleElement = document.querySelector("h1.style-scope.ytd-watch-metadata > yt-formatted-string.style-scope.ytd-watch-metadata");

    if (titleElement) {
      titleElement.parentNode.insertBefore(infoElement, titleElement.nextSibling);
      console.log("Info-Element wurde eingefügt:", infoElement); // Debug: Bestätigen, dass das Element eingefügt wurde
    } else {
      console.error("Titel-Element wurde nicht gefunden!"); // Debug: Fehler, wenn das Titel-Element nicht existiert
    }
  }

   // Event Listener, um Textfarbe bei Klick zu wechseln
   infoElement.addEventListener('click', () => {
    // Wenn Farbe Weiß, setze sie auf Schwarz, ansonsten Weiß
    infoElement.style.color = (infoElement.style.color === 'rgb(255, 255, 255)') ? '#000000' : '#FFFFFF';
  });

  // Aktualisiere den Inhalt des Elements
  infoElement.innerText = `Verbleibende Zeit: ${remainingTime} | Endzeit: ${endTime} Uhr`;
};

// Funktion zur Formatierung der Zeit in hh:mm:ss
const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
};

// Funktion zur Aktualisierung der Videoinformationen
const updateVideoInfo = () => {
  const videoElement = document.querySelector("video");

  if (videoElement) {
    const remainingTimeInSeconds = videoElement.duration - videoElement.currentTime;

    // Formatierte verbleibende Zeit
    const formattedRemainingTime = formatTime(remainingTimeInSeconds);

    // Berechnet die Endzeit basierend auf der aktuellen Zeit und der Restlaufzeit
    const now = new Date();
    const endTime = new Date(now.getTime() + remainingTimeInSeconds * 1000);
    const formattedEndTime = formatTime(endTime.getHours() * 3600 + endTime.getMinutes() * 60 + endTime.getSeconds());

    // Aktualisiere das Info-Element nur, wenn es sich um kein Livestream handelt
    if (!isLiveStream) {
      updateInfoElement(formattedRemainingTime, formattedEndTime);
    }
  } else {
    console.error("Kein Videoelement gefunden!"); // Debug: Fehler, wenn das Videoelement nicht existiert
  }
};

// Funktion zur Überprüfung, ob es sich um einen Livestream handelt
const checkIfLiveStream = () => {
  const pageContent = document.body.innerText || document.body.textContent;

  if (pageContent.includes("Livestream gestartet") || pageContent.includes("Aktiver Livestream seit") || pageContent.includes("Premiere") && !pageContent.includes("Chatwiedergabe nach dem Livestream")) {
    isLiveStream = true;
    console.log("Livestream erkannt"); // Debug: Bestätigen, dass ein Livestream erkannt wurde
  }

  if (!isLiveStream) {
    // Starte die Aktualisierung jede halbe Sekunde für normale Videos
    setInterval(updateVideoInfo, 500);
  }
};

// Starte die Überprüfung und Aktualisierung, sobald die Seite geladen ist
setTimeout (window.addEventListener('load', () => {
  checkIfLiveStream();
})), 2000;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Nachricht empfangen:", request.action);  // Logge empfangene Nachrichten
  if (request.action === "getVideoInfo") {
    // Starte die Aktualisierung sofort, wenn eine Nachricht empfangen wird
    updateVideoInfo();

    // Sende die verbleibenden Video-Informationen
    const videoElement = document.querySelector("video");
    const titleElement = document.querySelector("h1.style-scope.ytd-watch-metadata > yt-formatted-string.style-scope.ytd-watch-metadata");
    const videoTitle = titleElement ? titleElement.textContent : "Titel nicht gefunden";

    if (videoElement) {
      const remainingTimeInSeconds = videoElement.duration - videoElement.currentTime;
      const formattedRemainingTime = formatTime(remainingTimeInSeconds);

      const now = new Date();
      const endTime = new Date(now.getTime() + remainingTimeInSeconds * 1000);
      const formattedEndTime = formatTime(endTime.getHours() * 3600 + endTime.getMinutes() * 60 + endTime.getSeconds());

      sendResponse({
        isLiveStream: isLiveStream,
        isPaused: videoElement.paused,
        remainingTime: formattedRemainingTime,
        endTime: formattedEndTime,
        title: videoTitle  // Den Titel aus dem h1-Element senden
      });

      console.log("Antwort gesendet:", {
        remainingTime: formattedRemainingTime,
        endTime: formattedEndTime,
        title: videoTitle,
      });
    } else {
      console.error("Kein Videoelement gefunden.");
    }
  }
});