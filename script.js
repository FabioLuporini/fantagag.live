// Oggetto che associa i nomi delle squadre ai nomi delle immagini
const immaginiSquadre = {
    "A.C. Looters": "a.c._looters.png",
    "CA River Nave": "ca_river_nave.png",
    "FC Amaca Boys": "fc_amaca_boys.png",
    "F,C SHAKA": "f,c_shaka.png",
    "Fc Galaxy": "fc_galaxy.png",
    "Loop FC": "loop_fc.png",
    "PS Marlia United": "ps_marlia_united.png",
    "Real Barbarian": "real_barbarian.png",
    // Aggiungi gli altri nomi delle squadre e le relative immagini
};

// Funzione per associare l'immagine alla seconda colonna in base al testo della terza colonna
function associaImmagini() {
    const righeTabella = document.querySelectorAll(".responsive-table tbody tr");
    
    righeTabella.forEach(riga => {
        const nomeSquadra = riga.cells[2].textContent;
        const immagineSrc = immaginiSquadre[nomeSquadra];
        if (immagineSrc) {
            const colonnaLogo = riga.querySelector(".logo-cell");
            colonnaLogo.innerHTML = `<img src="immagini/${immagineSrc}" alt="${nomeSquadra}" style="width: 40px; height: 40px; border-radius: 50%;">`;
        }
    });
}

// Richiama la funzione quando il documento è pronto
document.addEventListener("DOMContentLoaded", associaImmagini);
