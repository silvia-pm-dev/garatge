//Definim les constants que utilitzarem de manera global, la url de la api i dos elements, el input i el botó
const API_URL = "http://localhost:3000/garage";
const llista = document.getElementById("cotxes");
const button = document.getElementById("button");

//Primer de tot farem prova de connexió i és el que s'iniciarà amb la web, he considerat que el més important
// era saber si tenim connexió o no.
//Utilitzant async/await creem constants per l'emoticona i la frase en vermell de l'estat
async function comprovarConnexio() {
    const emote = document.getElementById("emote");
    const connexio = document.getElementById("connexio");
    try {
        //Demanem resposta al server de l'enllaç, si està .ok canviem l'emoticona i l'estat de la connexió
        const res = await fetch(API_URL);
        if (res.ok) {
            emote.innerHTML = "&#128077;";
            connexio.textContent = " Connectat";
            connexio.style.color = "green";
        } else {
            throw new Error();
        }
    } catch (error) {
        //Capturem l'error de connexió i tornem a deixar-ho en vermell
        emote.innerHTML = "&#128078;";
        connexio.textContent = " Sense connexió";
        connexio.style.color = "red";
    }
}

//Una altra funció que he decidit carregar d'inici ja que la BD pot estar plena.
//Bàsicament l'estructura es la típica de async/await, si la resposta és ok la passem a json, buidem la llista perquè no es dupliqui, 
// fem un forEach per recorrer l'array que ens ha entrat i cada valor se'n va a la llista ul, creant un li, cadascún amb la seva 
// matrícula, els km , preu de venta i els dos botons d'esborrar i actualitzar km. He aprofitat aquí en el innerHTML per a afegir les funcions onclick
// de cada botó ja que no me'n sortia o em quedava tot massa rebuscat. Un altre error que m'he trobat és que el PUT del server 
// modifica matricula i km, per tant li hem de passar matrícula també, ja que sino dona error. La llista té un .reverse per obtenir-ho
// per ordre des de l'últim entrat, que és el que he trobat més lògic.
async function obtenirLlista() {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            const vehicles = await res.json();
            llista.innerHTML = "";
            
            vehicles.reverse().forEach(v => {
                const preu = calculPreuVenta(v.km);
                llista.innerHTML += `<li class="fila">
                                        <span class="info">${v.plate} - ${v.km} km</span>
                                        <span class="preuVenta">
                                            Preu venta: ${preu}€
                                        </span>
                                        <div>
                                            <button class="km" onclick="modificarKm('${v.id}', ${v.km}, '${v.plate}')">Km</button> 
                                            <button class="delete" onclick="deleteCotxe('${v.id}')">X</button>
                                        </div>
                                    </li>`;
            });
        }
    } catch (error) {
        console.error("No s'ha pogut recuperar la llista:", error);
    }
}

//Mètode d'afegir les matricules. 
//Seguim fent el mateix procediment, rebem la info, en aquest cas fem comprovacions, validem la matricula, i mirem que no estigui repetida.
async function afegirMatricula() {
    const input = document.getElementById("input");
    const matricula = input.value.toUpperCase();
    if (!matricula) {
        alert("Has d'introduïr una matrícula!");
        return;
    }
    if (!validarMatricula(matricula)) {
        alert("El format de la matrícula no és correcte!");
        input.value = "";
        return;
    }
    try {
        const llistaActual = await fetch(API_URL);
        const vehiclesActuals = await llistaActual.json();
        if (vehiclesActuals.some(v => v.plate.toUpperCase() === matricula)) {
            alert("Aquest cotxe ja està registrat!");
            input.value = "";
            return;
        }
        //Aquí és on canvia la cosa i li demanem al server que utilitzi el mètode POST.
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                plate: matricula,
                km: 0
            })
        });
        if (res.ok) {
            alert('Vehicle afegit: ' + matricula);
            input.value = "";
            await obtenirLlista();
        } else {
            console.error("Error del servidor");
        }
    } catch (error) {
        console.error("Error del servidor");
    }
}

//Funció extra per fer el procés de validació d'una matrícula correcta, després he vist que hi ha el regex, ho he deixat així.
//Simplement mirem que siguin 7 caràcters i que els 4 primers siguin un número i que els 3 últims siguin una d'aquestes lletres.
//No és òptim, però és decent, crec.
function validarMatricula(matricula) {
    matricula = matricula.toUpperCase();
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
    const numeros = "0123456789";
    if (matricula.length !== 7) return false;
    for (let i = 0; i < 4; i++) {
        if (!numeros.includes(matricula[i])) return false;
    }
    for (let i = 4; i < 7; i++) {
        if (!consonants.includes(matricula[i])) return false;
    }
    return true;
}

//El més senzill, fem mètode DELETE a partir del id
async function deleteCotxe(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        if (res.ok) {
            await obtenirLlista();
        }
    } catch (error) {
        console.error("Error a l'esborrar");
    }
}

//La més difícil per mi. No em funcionava i després de fer mil proves he vist que el update del PUT 
// fa un SET a km i matricula, llavors em donava error perquè no li estava donant el paràmetre de la matrícula.
//L'he afegit i ha funcionat perfecte.
async function modificarKm(id, kmNous, matricula) {
    const valor = prompt("Indica els Km:", kmNous);
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                plate: matricula, 
                km: parseInt(valor) 
            })
        });
        if (res.ok) {
            await obtenirLlista();
        }
    } catch (error) {
        console.error("Error al modificar");
    }
}

//Aquí li diem què ha de fer quan es faci click al botí d'afegir. Ho volia fer igual amb els altres botons,
// al venir de un innerHTML m'he tornat boja, podia fer-ho al fer click a un pare, i després filtrar quin fill era
// per dir-li què fer, però en casos d'apps grans no és òptim perquè et filtra cada click. També he pensat que si
// ho hagues fet amb un formulari i submit hagués estat més fàcil, però ho he deixat tal i com ho tenia i li he donat
// la comanda als altres dos botons desde el innerHTML.
button.onclick = afegirMatricula;

//Aquí li diem que cada cop que carregui la pàgina o recarregui fagi comprovarConnexio i obtenirLlista
window.onload = async () => {
    await comprovarConnexio();
    obtenirLlista();
};

//Funció per generar preus aleatòris descomptant basat en els km fets, i sumant amb el Math.random.
//Obviament al no estar inclós a la BD no es guarda, és només una funció per fer-ho una mica més graciós.
function calculPreuVenta(km) {
    const preuBase = 20000;
    let devalueKm = km*0.1;
    if (km===0) {
        devalueKm = 0;
    }
    const randomValue = Math.floor(Math.random() * 1000);
    let preu = preuBase - (devalueKm) + randomValue;
    if (preu<0) {
        preu = 1;
    }
    return preu;
}