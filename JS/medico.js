const base=[
    {user: 'jefe de area', pass:'123', rol:'Jefes de area', url:'jefea.html'},
    {user: 'enfermero', pass:'123', rol:'Enfermeros', url:'enfermero.html'},
]

//iniciar sesion
function iniciarSesion(e){
    e.preventDefault();
    const inputUser = document.getElementById('inputUser').value.trim();
    const inputPass = document.getElementById('inputPass').value.trim();

    const usuarioAutenticado=base.find(
        u=> u.user=== inputUser && u.pass === inputPass
    );

    if(usuarioAutenticado){
        //almacenar datos sessionstorage
        sessionStorage.setItem('sesionActiva', JSON.stringify(usuarioAutenticado));
        registrarAcceso();
        //redirijo la pagina
        window.location.href=usuarioAutenticado.url; 
    }else{
        document.getElementById('errorMsg').classList.remove('d-none');
    
    }
}
    function cerrarSesion(){
        if(confirm("¿Quieres salir de la sesion?")){
        sessionStorage.removeItem('sesionActiva');
        window.location.href="index.html"
    }
}


    function verificarAcceso(rolRequerido){
        const sesion=JSON.parse(sessionStorage.getItem('sesionActiva'));
        if(!sesion){
            //no hay sesion
            window.location.href="index.html";
        }else if(sesion.rol !== rolRequerido){
            //si hay sesion pero no es de su rol
            window.location.href=sesion.url;
        }else{
            //all ok
            document.getElementById('infoUsuario').textContent=`😊 ${sesion.user}`;
        }

    }

    function saltarLoginSiAutenticado(){
        const sesion=JSON.parse(sessionStorage.getItem('sesionActiva'));
        if(sesion){
            alert(`Ya hay una sesión iniciada como" ${sesion.rol}.`);
            window.location.href=sesion.url;
        }
    }

    function registrarAcceso(){
        let accesos=JSON.parse(sessionStorage.getItem('accesos')) || [];
        let horaf= new Date();
        let fechaHora = horaf.toLocaleString();
        let nuevoAcceso = "Acceso"+(accesos.length+1)+": "+fechaHora;
        accesos.push(nuevoAcceso);
        sessionStorage.setItem('accesos', JSON.stringify(accesos));
    }
//jefes de area
const form = document.getElementById("formUsuario");
const listaEquipos = document.getElementById("listaEquipos");
const btnGuardar = document.getElementById("btnGuardar");
const btnActualizar = document.getElementById("btnActualizar");
const btnLimpiar = document.getElementById("btnLimpiar");
let equipoEditado = null;

function mostrarEquipos() {
    if (!listaEquipos) return;
    let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];

    for (let i = 0; i < equipos.length; i++) {
        if (equipos[i].disponible === undefined) {
            equipos[i].disponible = true;
        }
    }
    localStorage.setItem("inventarioEquipos", JSON.stringify(equipos));

    listaEquipos.innerHTML = "";

    if (equipos.length === 0) {
        listaEquipos.innerHTML = "<p class='text-muted'> No hay equipos registrados</p>";
        return;
    }

    equipos.forEach((e, index) => {
        let estadoTexto = "Disponible";
        if (e.disponible === false) {
            estadoTexto = "No disponible";
        }

        listaEquipos.innerHTML += `
        <div class="card mb-2 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5>${e.idequipo}</h5>
              <p class="mb-0"><strong>Tipo de Equipo:</strong> ${e.tequipo}</p>
              <p class="mb-0"><strong>Estado:</strong> ${estadoTexto}</p>
            </div>
            <div>
              <button class="btn btn-sm btn-primary me-2" onclick="editarEquipo(${index})">Editar</button>
              <button class="btn btn-sm btn-danger me-2" onclick="borrarEquipo(${index})">Eliminar</button>
            </div>
          </div>
        </div>
        `;
    });
}

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const idequipo = document.getElementById("idequipo").value.trim();
        const tequipo = document.getElementById("tequipo").value.trim();

        if (!idequipo || !tequipo) return alert("todos los campos son obligatorios");
        let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];

        if (equipoEditado !== null) {
            let estadoActual = equipos[equipoEditado].disponible;
            if (estadoActual === undefined) {
                estadoActual = true;
            }
            equipos[equipoEditado] = { idequipo, tequipo, disponible: estadoActual };
            equipoEditado = null;
            btnActualizar.classList.add("d-none");
            btnGuardar.classList.remove("d-none");
        } else {
            equipos.push({ idequipo, tequipo, disponible: true });
        }

        localStorage.setItem("inventarioEquipos", JSON.stringify(equipos));
        form.reset();
        mostrarEquipos();
    });
}

function borrarEquipo(index) {
    let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
    equipos.splice(index, 1);
    localStorage.setItem("inventarioEquipos", JSON.stringify(equipos));
    mostrarEquipos();
}

if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
        localStorage.removeItem("inventarioEquipos");
        mostrarEquipos();
    });
}

function editarEquipo(index) {
    let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
    const equipo = equipos[index];
    document.getElementById("idequipo").value = equipo.idequipo;
    document.getElementById("tequipo").value = equipo.tequipo;

    equipoEditado = index;
    btnGuardar.classList.add("d-none");
    btnActualizar.classList.remove("d-none");
}

//prestamo
const formPrestamo = document.getElementById("formPrestamo");
const selectEquipoDisponible = document.getElementById("selectEquipoDisponible");
const listaDisponibles = document.getElementById("listaDisponibles");
const prestamosActivos = document.getElementById("prestamosActivos");

function mostrarInfo() {
    if (!selectEquipoDisponible && !listaDisponibles && !prestamosActivos) return;

    let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
    let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];

    if (selectEquipoDisponible) {
        selectEquipoDisponible.innerHTML = `<option value="">Elije un equipo disponible</option>`;
        for (let i = 0; i < equipos.length; i++) {
            if (equipos[i].disponible === true) {
                selectEquipoDisponible.innerHTML += `<option value="${i}">${equipos[i].idequipo} - ${equipos[i].tequipo}</option>`;
            }
        }
    }

    if (listaDisponibles) {
        listaDisponibles.innerHTML = "";
        let hayDisponibles = false;

        equipos.forEach((eq) => {
            if (eq.disponible === true) {
                hayDisponibles = true;
                listaDisponibles.innerHTML += `
                <div class="card mb-2 shadow-sm">
                <div class="card-body">
                <h5>${eq.idequipo}</h5>
                <p class="mb-0"><strong>Tipo de Equipo:</strong> ${eq.tequipo}</p>
                <p class="mb-0"><strong>Estado:</strong> Disponible</p>
                </div>
                </div>
          `;
            }
        });

        if (!hayDisponibles) {
            listaDisponibles.innerHTML = "No hay equipos disponibles";
        }
    }

    if (prestamosActivos) {
        prestamosActivos.innerHTML = "";
        if (prestamos.length === 0) {
            prestamosActivos.innerHTML = "No hay préstamos";
        } else {
            prestamos.forEach((p, index) => {
                prestamosActivos.innerHTML += `
                <div class="card mb-2 shadow-sm">
                  <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5>${p.idequipo}</h5>
                      <p class="mb-0"><strong>Enfermero:</strong> ${p.enfermero}</p>
                      <p class="mb-0"><strong>Fecha:</strong> ${p.fecha}</p>
                    </div>
                    <button class="btn btn-sm btn-success" onclick="devolverEquipo(${index})">Devolver</button>
                  </div>
                </div>
                `;
            });
        }
    }
}

if (formPrestamo) {
    formPrestamo.addEventListener("submit", (e) => {
        e.preventDefault();
        let indice = selectEquipoDisponible.value;
        if (indice === "") return alert("Elije un equipo");

        let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
        let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];
        let sesion = JSON.parse(sessionStorage.getItem("sesionActiva"));

        let enfermeroNombre = "Enfermero";
        if (sesion && sesion.user) {
            enfermeroNombre = sesion.user;
        }

        equipos[indice].disponible = false;

        prestamos.push({
            idequipo: equipos[indice].idequipo,
            tequipo: equipos[indice].tequipo,
            enfermero: enfermeroNombre,
            fecha: new Date().toLocaleString()
        });

        localStorage.setItem("inventarioEquipos", JSON.stringify(equipos));
        localStorage.setItem("prestamosActivos", JSON.stringify(prestamos));

        formPrestamo.reset();
        mostrarInfo();
    });
}

function devolverEquipo(index) {
    let equipos = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
    let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];

    let prestamo = prestamos[index];
    if (!prestamo) return;

    for (let i = 0; i < equipos.length; i++) {
        if (equipos[i].idequipo === prestamo.idequipo) {
            equipos[i].disponible = true;
        }
    }

    prestamos.splice(index, 1);

    localStorage.setItem("inventarioEquipos", JSON.stringify(equipos));
    localStorage.setItem("prestamosActivos", JSON.stringify(prestamos));

    mostrarInfo();
}

document.addEventListener("DOMContentLoaded", () => {
    mostrarEquipos();
    mostrarInfo();
});