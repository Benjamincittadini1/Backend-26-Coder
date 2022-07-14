let socket = io();

fetch("/api/productos-test")
    .then(response => response.json())
    .then(data => {
        renderTable(data);
    })
    .catch(error => console.log(error));

function renderTable(data) {
    const table = document.getElementById("table");
    const html = data.map(element => {
        return (`<tr>
        <td>${element.name}</td>
        <td>${element.price}</td>
        <td><img src="${element.image}" style="height:100px"></td>
        </tr>`);
    }).join("");
    table.innerHTML += html;
}

const ingresoMensaje = document.getElementById("ingresoMensaje");
const botonEnviar = document.getElementById("botonEnviar");

botonEnviar.addEventListener('click', (e) => {
    e.preventDefault()
    const mensaje = {
        author: {
            id: ingresoMensaje.children.id.value,
            nombre: ingresoMensaje.children.nombre.value,
            apellido: ingresoMensaje.children.apellido.value,
            edad: ingresoMensaje.children.edad.value,
            alias: ingresoMensaje.children.alias.value,
            avatar: ingresoMensaje.children.avatar.value,
        },
        text: ingresoMensaje.children.text.value
    }
    socket.emit('enviarMensaje', mensaje);
})

//normalizr esquemas
const authorsSchema = new normalizr.schema.Entity('authors');
const msjSchema = new normalizr.schema.Entity('mensajes', { author: authorsSchema }, { idAttribute: 'id' });
const fileSchema = [msjSchema]

const renderMsj = (msj) => {
    msj.map(element => {
        const html = ` <article>
        <span class="id">${element._doc.author.id}</span><span class="time">[${element._doc.author.timestamp}]:</span><span clas="text">${element._doc.text}</span><img src="${element._doc.author.avatar}" alt="avatar" class="avatar">
                        </article>`;
        const mensajes = document.getElementById("mensajes");
        mensajes.innerHTML += html;
    })
}
//denormalizar mensajes
socket.on('mensajes', (msj) => {
    const denormMsjs = normalizr.denormalize(msj.result, fileSchema, msj.entities);
    renderMsj(denormMsjs);
    renderComp(msj, denormMsjs);
})
//render mensajes
const renderComp = (msj, denormMsjs) => {
    const comp = document.getElementById("compresion");
    const denormMsjsLength = (JSON.stringify(denormMsjs)).length;
    const msjLength = (JSON.stringify(msj)).length;
    const compresion = ((msjLength - denormMsjsLength) / msjLength * 100).toFixed(2);
    comp.innerHTML = `(Compresion: ${compresion}%)`;
}

//proceso login logout
//conseguir el userName
fetch("/getUserName")
    .then(response => response.json())
    .then(data => {
        userName = data.user;
        document.getElementById("userName").innerHTML = userName;
    })
    .catch(error => console.log(error));
//loading screen
const loading = document.getElementById("loading");
loading.style.display = "none";

//logout con loading screen
document.getElementById("logout").addEventListener
    ('click', (e) => {
        e.preventDefault()
        fetch("/logout")
            .then(loading.style.display = "flex")
            .then(response => response.json())
            .finally(() => {
                window.location.href = "/logoutMsj";
            })
    })


