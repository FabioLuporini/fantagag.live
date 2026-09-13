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

function associaImmagini() {
    const righe = document.querySelectorAll(".team-row");

    righe.forEach(riga => {
        const nomeSquadra = riga.dataset.team.trim();
        const immagine = immaginiSquadre[nomeSquadra];

        if (!immagine) return;

        const logoCell = riga.querySelector(".logo-cell");
        const img = document.createElement("img");

        img.src = `immagini/${immagine}`;
        img.alt = nomeSquadra;
        img.className = "team-logo";

        logoCell.appendChild(img);
    });
}

function leggiClassificaPrecedente() {
    try {
        const salvata = localStorage.getItem("fantagagClassifica");
        return salvata ? JSON.parse(salvata) : null;
    } catch (errore) {
        console.log("Impossibile leggere la classifica precedente", errore);
        return null;
    }
}

function salvaClassificaCorrente(righe) {
    const classifica = {};

    righe.forEach((riga, indice) => {
        classifica[riga.dataset.team.trim()] = indice + 1;
    });

    localStorage.setItem("fantagagClassifica", JSON.stringify(classifica));
}

function animaSorpassi() {
    const righe = Array.from(document.querySelectorAll(".team-row"));
    if (!righe.length) return;

    const precedente = leggiClassificaPrecedente();

    if (!precedente) {
        salvaClassificaCorrente(righe);
        return;
    }

    const posizioneTop = {};
    righe.forEach((riga, indice) => {
        posizioneTop[indice + 1] = riga.getBoundingClientRect().top;
    });

    let esisteCambio = false;

    righe.forEach((riga, indice) => {
        const squadra = riga.dataset.team.trim();
        const nuovaPosizione = indice + 1;
        const vecchiaPosizione = precedente[squadra];

        if (!vecchiaPosizione) return;

        const differenza = vecchiaPosizione - nuovaPosizione;
        if (differenza === 0) return;

        esisteCambio = true;

        const movement = riga.querySelector(".movement");

        if (differenza > 0) {
            movement.textContent = `▲ +${differenza}`;
            movement.classList.add("up");
            riga.classList.add("position-up");
        } else {
            movement.textContent = `▼ ${differenza}`;
            movement.classList.add("down");
            riga.classList.add("position-down");
        }

        const posizioneVecchiaTop = posizioneTop[vecchiaPosizione];
        const posizioneNuovaTop = riga.getBoundingClientRect().top;

        if (posizioneVecchiaTop === undefined) return;

        const distanza = posizioneVecchiaTop - posizioneNuovaTop;

        riga.style.transition = "none";
        riga.style.transform = `translateY(${distanza}px)`;
    });

    document.body.offsetHeight;

    requestAnimationFrame(() => {
        righe.forEach(riga => {
            if (
                !riga.classList.contains("position-up") &&
                !riga.classList.contains("position-down")
            ) return;

            riga.style.transition = "transform 850ms cubic-bezier(.2,.8,.2,1)";
            riga.style.transform = "translateY(0)";
        });
    });

    if (esisteCambio) {
        setTimeout(() => {
            righe.forEach(riga => {
                if (riga.classList.contains("position-up")) {
                    riga.classList.add("arrived-up");
                }
                if (riga.classList.contains("position-down")) {
                    riga.classList.add("arrived-down");
                }
            });
        }, 850);
    }

    salvaClassificaCorrente(righe);
}

document.addEventListener("DOMContentLoaded", () => {
    associaImmagini();
    setTimeout(animaSorpassi, 100);
});
