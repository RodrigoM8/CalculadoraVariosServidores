let results = {}

function showOptions(o) {
    //console.log(o.value)
    if (o.value > 1) {

        document.getElementById("limit").style.display = "block";
        document.getElementById("Calvalues2").style.display = "";
        document.getElementById("Calvalues2").classList = "bg-2 row p4";
        document.getElementById("Calvalues1").style.display = "none";

    }
    else {
        document.getElementById("limit").style.display = "none";
        document.getElementById("Calvalues1").style.display = "";
        document.getElementById("Calvalues1").className = "bg-2 row p4";
        document.getElementById("Calvalues2").style.display = "none";
    }
}

function printPageArea() {
    var printContent = document.getElementById('Results').innerHTML;
    var originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
}


function GetValues() {

    //Crear objeto que albergará los valores ingresados
    let form = {}

    //Inicializarlos
    form["tasa_llegada"] = 0
    form["tiempo_servicio"] = 0
    form["limite_cola"] = 0
    form["cantidad_servidores"] = 0

    //Asignar los valores en función de los datos ingresados en los inputs
    form["tasa_llegada"] = document.querySelector("#tasaLlegada").value
    form["tiempo_servicio"] = document.querySelector("#tiempoServicio").value
    form["limite_cola"] = document.querySelector("#limit").value
    form["cantidad_servidores"] = document.querySelector("#cantidadServ").value
    form['opt'] = document.querySelector("#opt").value

    //Empty Form - Limpiar datos de los inputs
    document.querySelector("#tasaLlegada").value = ''
    document.querySelector("#tiempoServicio").value = ''
    document.querySelector("#limit").value = ''
    document.querySelector("#cantidadServ").value = ''

    return form
}

function factorial(n) {
    var total = 1;
    for (i = 1; i <= n; i++) {
        total = total * i;
    }
    return total;
}

function SinLimite(form) {

    //CALCULO DE RHO
    results["rho"] = form.tasa_llegada / form.tiempo_servicio

    //CALCULO DE Po
    const parte2P0 = ((results.rho ** form.cantidad_servidores) / (factorial(form.cantidad_servidores) * (1 - (results.rho / form.cantidad_servidores))))
    let contadorP0 = 0;
    let sumatoriaP0 = 0;
    while (contadorP0 < form.cantidad_servidores) {
        sumatoriaP0 += ((results.rho ** contadorP0) / factorial(contadorP0));
        contadorP0++;
    }

    const parteFinalP0 = (sumatoriaP0 + parte2P0) ** -1;
    results["Po"] = parteFinalP0

    //////////////////////////////////////////////////////////////////////////////////////

    //CALCULO DE Pn
    let stop = false
    let n = 0
    let Pn = 0
    let sum = 0
    var arregloPn = []

    while (!stop) {

        if (n <= form.cantidad_servidores) {

            Pn = (((results.rho ** n) / (factorial(n))) * results.Po) //Formula 1 - n_Menor_q_C 

        } else {

            Pn = (((results.rho ** n) / ((form.cantidad_servidores ** (n - form.cantidad_servidores)) * factorial(form.cantidad_servidores))) * results.Po) //Formula 2 - n_mayor_q_C

        }

        arregloPn[n] = []
        arregloPn[n]["n"] = Number(n).toFixed(0)
        arregloPn[n]["Pn"] = Number(Pn)

        sum += Number(Pn)
        arregloPn[n]["Sum-Pn"] = sum

        n++
        if (Number(sum).toFixed(4) == 0.9999) {
            stop = true; break;
        }

        Pn = 0
    }

    results["Pn"] = arregloPn

    //////////////////////////////////////////////////////////////////////////////////////

    //CALCULO DE Lq
    results["Lq"] = (((results.rho ** (Number(form.cantidad_servidores) + 1)) / (factorial(form.cantidad_servidores - 1) * (form.cantidad_servidores - results.rho) ** 2)) * results.Po)

    //CALCULO DE Ls
    results["Ls"] = results.Lq + results.rho

    //CALCULO DE Wq
    results["Wq"] = results.Lq / form.tasa_llegada

    //CALCULO DE Ws
    results["Ws"] = results.Wq + (1 / form.tiempo_servicio)

} //Final / Sin limite


function ConLimite(form) {

    results["rho"] = form.tasa_llegada / form.tiempo_servicio

    let Pc = results.rho / form.cantidad_servidores

    // CALCULO DE P0
    if (Pc === 1) {
        Po = ((results.rho ** form.cantidad_servidores / factorial(form.cantidad_servidores)) * (form.limite_cola - form.cantidad_servidores + 1))
    } else {
        Po = (((results.rho ** form.cantidad_servidores) * ((1 - (results.rho / form.cantidad_servidores) ** (form.limite_cola - form.cantidad_servidores + 1))) / (factorial(form.cantidad_servidores) * (1 - (results.rho / form.cantidad_servidores)))))
    }

    let contadorP0 = 0;
    let sumatoriaP0 = 0;
    while (contadorP0 < form.cantidad_servidores) {
        sumatoriaP0 += ((results.rho ** contadorP0) / factorial(contadorP0));
        contadorP0++;
    }

    const parteFinalP0 = (sumatoriaP0 + Po) ** -1;
    results["Po"] = parteFinalP0

    //CALCULO DE LQ
    if (Pc === 1) {
        Lq = (results.Po * ((results.rho ** form.cantidad_servidores) * (form.limite_cola - form.cantidad_servidores) * (form.limite_cola - form.cantidad_servidores + 1) / (2 * factorial(form.cantidad_servidores))))
    } else {
        Lq = ((results.Po * (results.rho ** (Number(form.cantidad_servidores) + 1)) / (factorial(Number(form.cantidad_servidores) - 1) * (form.cantidad_servidores - results.rho) ** 2)) * (1 - ((results.rho / form.cantidad_servidores) ** (form.limite_cola - form.cantidad_servidores)) - (form.limite_cola - form.cantidad_servidores) * (results.rho / form.cantidad_servidores) ** (form.limite_cola - form.cantidad_servidores) * (1 - (results.rho / form.cantidad_servidores))))

    }
    results["Lq"] = Lq
    console.log("Calculo LQ: " + results.Lq)

    //CALCULO DE PN
    let stop = false
    let n = 0
    let Pn = 0
    let sum = 0
    var arregloPn = []


    while (!stop) {

        if (n <= form.cantidad_servidores) {

            Pn = (((results.rho ** n) / (factorial(n))) * results.Po) //Formula 1 cuando n_Menor_q_C 


        } else {

            Pn = (((results.rho ** n) / ((form.cantidad_servidores ** (n - form.cantidad_servidores)) * factorial(form.cantidad_servidores))) * results.Po) //Formula 2 - n_mayor_q_C

        }

        arregloPn[n] = []
        arregloPn[n]["n"] = Number(n).toFixed(0)
        arregloPn[n]["Pn"] = Number(Pn)

        sum += Number(Pn)
        arregloPn[n]["Sum-Pn"] = sum

        n++
        if (n > form.limite_cola) {
            stop = true; break;
        }

        Pn = 0
    }
    results["Pn"] = arregloPn

    results["LambdaEfectiva"] = form.tasa_llegada * (1 - results.Pn[form.limite_cola].Pn)

    results["LambdaPerdida"] = form.tasa_llegada - results.LambdaEfectiva

    results["Ls"] = results.Lq + (results.LambdaEfectiva / form.tiempo_servicio)

    results["Wq"] = (results.Lq) / (results.LambdaEfectiva)

    results["Ws"] = (results.Wq) + (1 / form.tiempo_servicio)
}


function ShowValues(form) {

    document.getElementById("Lambda1").innerHTML = form.tasa_llegada;
    document.getElementById("Mu1").innerHTML = form.tiempo_servicio;
    document.getElementById("Lambda2").innerHTML = form.tasa_llegada;
    document.getElementById("Mu2").innerHTML = form.tiempo_servicio;
    document.getElementById("limiteCola").innerHTML = form.limite_cola;
    document.getElementById("servidores1").innerHTML = form.cantidad_servidores
    document.getElementById("servidores2").innerHTML = form.cantidad_servidores

    let tableHead = document.createElement('tr')
    let nombres_columnas = Object.keys(results).map(e => e = "<th>" + e + "</th>")
    tableHead.innerHTML = "<tr>" + nombres_columnas + "</tr>"


    let tableRow = document.createElement('tr')

    let vcolumnas = []
    Object.keys(results).forEach(e => {
        if (e.toString() != "Pn")
            vcolumnas.push("<td>" + Number(results[e]).toFixed(4) + "</td>")
        else
            vcolumnas.push("<td class='p4'>" + (results[e].length - 1) + "</td>")
    })

    let tableData = vcolumnas
    
    tableRow.innerHTML = "<tr>" + tableData + "</tr>"

    //#region Tabla Estadistica  
    let tH = document.createElement('tr')
    tH.id = "head"
    document.querySelector('#tabelas').append(tH);
    Object.keys(results).forEach(x => {
        tH = document.createElement('th')
        tH.innerHTML = "<th class='p2'>" + x + "</th>"
        document.querySelector('#head').append(tH);
    })

    tH = document.createElement('tr')
    tH.id = "data"
    document.querySelector('#tabelas').append(tH);
    vcolumnas.forEach(x => {
        tH = document.createElement('td')
        tH.innerHTML = x
        document.querySelector('#data').append(tH);
    })


    //#region Pn  
    vcolumnas = []
    results.Pn.forEach(e => {
        Object.keys(results.Pn[0]).forEach(x => {
            vcolumnas.push("<td>" + Number(e[x]).toFixed(4) + "</td>")
        })
    })


    tH = document.createElement('tr')
    tH.id = "head1"
    document.querySelector('#tabelas2').append(tH);
    Object.keys(results.Pn[0]).forEach(x => {
        tH = document.createElement('th')
        tH.innerHTML = "<th class='p2'>" + x + "</th>"
        document.querySelector('#head1').append(tH);
    })


    let k = ""
    let i = 0
    vcolumnas = []


    if (results.Pn.length > 0) {
        document.getElementById("Values2").style.display = "block";
    }


    results.Pn.forEach(e => {
        tH = document.createElement('tr')
        tH.id = "data" + i
        k = "#" + tH.id
        console.log(k)
        document.querySelector('#tabelas2').append(tH);

        Object.keys(results.Pn[0]).forEach(x => {

            tH = document.createElement('td')
            tH.innerHTML = ("<td>" + Number(e[x]).toFixed(4) + "</td>")
            document.querySelector(k).append(tH);
        })
        i++

    })

}


function EjecuteCalc() {

    try {

        let crearTablaNueva = document.getElementById('tabelas')

        while (crearTablaNueva.firstChild) {
            crearTablaNueva.removeChild(crearTablaNueva.firstChild);
        }

        crearTablaNueva = document.getElementById('tabelas2')
        while (crearTablaNueva.firstChild) {
            crearTablaNueva.removeChild(crearTablaNueva.firstChild);
        }

        var xx = GetValues()

        if (Number(xx.opt) > 1) {

            if (Number(xx.tasa_llegada === 0) || Number(xx.tiempo_servicio) === 0 || Number(xx.limite_cola) === 0) {
                alert("No es posible efectuar la operación con los datos ingresados. Por favor, corrobore los mismos.");
            } 
                else if (Number(xx.cantidad_servidores) <= 1) {
                    alert("Por favor, indique más de un servidor para proceder con el cálculo.");
            }
            
            else {
                ConLimite(xx)
            }
        }

        else {

            if (Number(xx.cantidad_servidores) * Number(xx.tiempo_servicio) <= Number(xx.tasa_llegada)) {
                alert("No es posible efectuar la operación con los datos ingresados ya que no se cumple la condición de estabilidad (por lo que la cola crecería indefinidamente).");
            } 
                else if (Number(xx.cantidad_servidores) <= 1) {
                    alert("Por favor, indique más de un servidor para proceder con el cálculo.");
            } 
                else if (Number(xx.tasa_llegada) === 0) {
                    alert("Por favor, ingrese un valor mayor a 0 en el apartado de 'Distribucion de Llegadas'.");
            }
            else {
                SinLimite(xx)
            }
        }

        ShowValues(xx)
        results = {} //Limpiar el JSON para que no se sobrescriban los valores
    }

    catch (e) {

    }

}