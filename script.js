const immaginiSquadre = {
    "A.C. Looters": "a.c._looters.png",
    "CA River Nave": "ca_river_nave.png",
    "Fc Amaca Boys": "fc_amaca_boys.png",
    "F,C SHAKA": "f,c_shaka.png",
    "Fc Galaxy": "fc_galaxy.png",
    "Loop FC": "loop_fc.png",
    "PS Marlia United": "ps_marlia_united.png",
    "Real Barbarian": "real_barbarian.png"
};

const STORAGE_CLASSIFICA = "fantagagClassifica";
const STORAGE_MOVIMENTI = "fantagagMovimenti";
const DURATA_SORPASSO = 1500;

function associaImmagini() {
    const righe = document.querySelectorAll(".team-row");

    righe.forEach(riga => {
        const nomeSquadra = riga.dataset.team.trim();
        const immagine = immaginiSquadre[nomeSquadra];

        if (!immagine) return;

        const logoCell = riga.querySelector(".logo-cell");
        if (!logoCell) return;

        if (logoCell.querySelector(".team-logo")) return;

        const img = document.createElement("img");
        img.src = `immagini/${immagine}`;
        img.alt = nomeSquadra;
        img.className = "team-logo";

        logoCell.appendChild(img);
    });
}

function leggiStorage(chiave, valoreDefault = null) {
    try {
        const salvato = localStorage.getItem(chiave);
        return salvato ? JSON.parse(salvato) : valoreDefault;
    } catch (errore) {
        console.log(`Impossibile leggere ${chiave}`, errore);
        return valoreDefault;
    }
}

function salvaStorage(chiave, valore) {
    try {
        localStorage.setItem(chiave, JSON.stringify(valore));
    } catch (errore) {
        console.log(`Impossibile salvare ${chiave}`, errore);
    }
}

function creaClassificaCorrente(righe) {
    const classifica = {};

    righe.forEach((riga, indice) => {
        classifica[riga.dataset.team.trim()] = indice + 1;
    });

    return classifica;
}

function mostraMovimenti(righe, movimenti) {
    righe.forEach(riga => {
        const squadra = riga.dataset.team.trim();
        const movement = riga.querySelector(".movement");

        if (!movement) return;

        movement.textContent = "";
        movement.classList.remove("up", "down");

        const differenza = movimenti[squadra];

        if (!differenza) return;

        if (differenza > 0) {
            movement.textContent = `▲ +${differenza}`;
            movement.classList.add("up");
        } else {
            movement.textContent = `▼ ${differenza}`;
            movement.classList.add("down");
        }
    });
}

function animaSorpassi() {
    const righe = Array.from(document.querySelectorAll(".team-row"));
    if (!righe.length) return;

    const precedente = leggiStorage(STORAGE_CLASSIFICA, null);
    const movimentiPrecedenti = leggiStorage(STORAGE_MOVIMENTI, {});
    const corrente = creaClassificaCorrente(righe);

    // Prima visita: salva la classifica senza animazione.
    if (!precedente) {
        salvaStorage(STORAGE_CLASSIFICA, corrente);
        salvaStorage(STORAGE_MOVIMENTI, {});
        return;
    }

    const nuoviMovimenti = {};
    let esisteCambio = false;

    righe.forEach((riga, indice) => {
        const squadra = riga.dataset.team.trim();
        const nuovaPosizione = indice + 1;
        const vecchiaPosizione = precedente[squadra];

        if (!vecchiaPosizione) return;

        const differenza = vecchiaPosizione - nuovaPosizione;

        if (differenza !== 0) {
            esisteCambio = true;
            nuoviMovimenti[squadra] = differenza;
        }
    });

    // Nessun nuovo cambio:
    // mantiene ▲/▼ dell'ultimo sorpasso senza rifare l'animazione.
    if (!esisteCambio) {
        mostraMovimenti(righe, movimentiPrecedenti);
        return;
    }

    mostraMovimenti(righe, nuoviMovimenti);

    const posizioneTop = {};

    righe.forEach((riga, indice) => {
        posizioneTop[indice + 1] =
            riga.getBoundingClientRect().top;
    });

    righe.forEach((riga, indice) => {
        const squadra = riga.dataset.team.trim();
        const nuovaPosizione = indice + 1;
        const vecchiaPosizione = precedente[squadra];
        const differenza = nuoviMovimenti[squadra];

        if (!vecchiaPosizione || !differenza) return;

        if (differenza > 0) {
            riga.classList.add("position-up");
        } else {
            riga.classList.add("position-down");
        }

        const posizioneVecchiaTop =
            posizioneTop[vecchiaPosizione];

        const posizioneNuovaTop =
            riga.getBoundingClientRect().top;

        if (posizioneVecchiaTop === undefined) return;

        const distanza =
            posizioneVecchiaTop - posizioneNuovaTop;

        riga.style.transition = "none";
        riga.style.transform =
            `translateY(${distanza}px)`;

        riga.style.zIndex = "5";
    });

    document.body.offsetHeight;

    requestAnimationFrame(() => {
        righe.forEach(riga => {

            if (
                !riga.classList.contains("position-up") &&
                !riga.classList.contains("position-down")
            ) return;

            // Animazione stile sorpasso Formula 1
            riga.style.transition =
                `transform ${DURATA_SORPASSO}ms cubic-bezier(.16, 1, .3, 1)`;

            riga.style.transform = "translateY(0)";
        });
    });

    setTimeout(() => {

        righe.forEach(riga => {

            if (riga.classList.contains("position-up")) {
                riga.classList.add("arrived-up");
            }

            if (riga.classList.contains("position-down")) {
                riga.classList.add("arrived-down");
            }

            riga.style.zIndex = "";
        });

    }, DURATA_SORPASSO);

    salvaStorage(
        STORAGE_CLASSIFICA,
        corrente
    );

    salvaStorage(
        STORAGE_MOVIMENTI,
        nuoviMovimenti
    );
}

document.addEventListener("DOMContentLoaded", () => {
    associaImmagini();
    setTimeout(animaSorpassi, 100);
});