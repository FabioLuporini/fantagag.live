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
const DURATA_SORPASSO = 2200;

const driverFrames = {"A.C. Looters": {"key": "looters", "files": ["matteo-looters.png", "matteo-looters-pugni.png", "matteo-looters-mask.png"]}, "CA River Nave": {"key": "river", "files": ["river-1.png", "river-2.png", "river-3.png"]}, "Fc Amaca Boys": {"key": "amaca", "files": ["amaca-1.png", "amaca-2.png", "amaca-3.png"]}, "F,C SHAKA": {"key": "shaka", "files": ["shaka-1.png", "shaka-2.png", "shaka-3.png"]}, "Fc Galaxy": {"key": "galaxy", "files": ["galaxy-1.png", "galaxy-2.png", "galaxy-3.png"]}, "Loop FC": {"key": "loop", "files": ["loop-1.png", "loop-2.png", "loop-3.png"]}, "PS Marlia United": {"key": "marlia", "files": ["marlia-1.png", "marlia-2.png", "marlia-3.png"]}, "Real Barbarian": {"key": "barbarian", "files": ["barbarian-1.png", "barbarian-2.png", "barbarian-3.png"]}};
function associaImmagini(){
 document.querySelectorAll('.team-row').forEach(row=>{
 const driver=driverFrames[row.dataset.team.trim()];if(!driver)return;
 const cell=row.querySelector('.logo-cell');const img=document.createElement('img');
 img.className='driver-portrait '+driver.key+'-portrait';img.alt=row.dataset.team;
 img.src='immagini/'+driver.files[0];cell.replaceChildren(img);
 let frame=0;driver.files.forEach(file=>{const preload=new Image();preload.src='immagini/'+file;});
 setInterval(()=>{frame=(frame+1)%3;img.src='immagini/'+driver.files[frame];},1800);
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
            riga.classList.add("position-up", "skidding");
            const smoke=document.createElement('span');smoke.className='skid-effect';smoke.setAttribute('aria-hidden','true');smoke.innerHTML='<i></i><i></i><i></i>';riga.appendChild(smoke);
            setTimeout(()=>{smoke.remove();riga.classList.remove('skidding');},2200);
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
async function aggiornaGiornata(){
 try{const response=await fetch('https://raw.githubusercontent.com/FabioLuporini/fantacalcio-voti-live/main/data/giornata.txt',{cache:'no-store'});
 if(!response.ok)return;const value=(await response.text()).trim();if(!/^\d{1,3}$/.test(value)||Number(value)<1)return;
 const label=document.getElementById('matchday');label.textContent='GIORNATA '+Number(value);label.hidden=false;
 }catch(error){console.warn('Giornata non disponibile',error);}
}
document.addEventListener('DOMContentLoaded',()=>{
 const label=document.getElementById('matchday');const live=document.querySelector('.live-status');
 function sizeDay(){const style=getComputedStyle(live);label.style.fontSize=style.fontSize;label.style.fontWeight=style.fontWeight;label.style.fontStyle=style.fontStyle;}
 sizeDay();window.addEventListener('resize',sizeDay);aggiornaGiornata();setInterval(aggiornaGiornata,60000);
});
