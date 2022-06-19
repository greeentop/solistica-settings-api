var conn = require("../db/db")();
var express = require('express');
const http = require('http').Server(express)
var router = express.Router();
const sql = require("mssql")
const io = require('socket.io')(http)

const fs = require('fs');
const path = require('path');
const { json } = require("body-parser");
const axios = require('axios')

const sha1 = require('js-sha1');



// const axios  =  require("axios");
const { log } = require("console");
const { connected, cpuUsage } = require("process");
const { route, use } = require("../routes/integracaoLogs.route");
const { compileFunction } = require("vm");

let axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
}



io.on('connect', function(socket) {

    console.log('a user has connect')
    socket.on('disconect', function() {
        console.log('a user diconect')
    });
});

const integracaoLogs = {};




integracaoLogs.getLogin = (req, res) => {

    const login = req.params.login
    const contrasena = req.params.contrasena
    conn.close();



    sha1(contrasena);
    var hash = sha1.create();
    hash.update(contrasena);


    conn.connect()
        .then(function() {
            var sqlQ = `SELECT * from TB_USERS  where login = '${login}' and PASSWORD = '${hash.hex()}'`;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    const achou = recordset.rowsAffected[0]
                    const user = recordset.recordset[0]
                    const branch = null;

                    console.log(user)


                    // if (user)
                    // conn.close();



                    var sqlQ1 = `SELECT B.* FROM TB_USERS_BRANCHES ub (nolock) inner join TB_BRANCHES b on ub.ID_BRANCH  =  b.ID_BRANCHES where ub.id_user  = ${user.ID_USER}`;

                    var req1 = new sql.Request(conn);

                    req1.query(sqlQ1)
                        .then(function(recordset1) {

                            const b = recordset1.recordset

                            res.json({ msg: 'Success', UserData: user, branches: b, status: res.status });
                        }).catch({

                        })



                    // if (achou == 0) {


                    //     conn.close();
                    //     res.json({ msg: 'Usuário sem acesso!', data: [], status: res.status });

                    // } else {


                    //     conn.close();
                    //     res.json({ msg: 'Success', data: recordset.recordset[0], status: res.status });
                    // }

                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data : ' + err);
                });
        })
        .catch(function(err) {
            // console.log(err)
            conn.close();
            res.status(400).send(err);
        })

}

integracaoLogs.getRotasDistribuicao = (req, res) => {


    const COD_FILIAIAS = req.params.cod_filiais
    conn.close();
    conn.connect()
        .then(function() {
            var sqlQ = `SELECT * from GREENTOP..TB_FILIAIS_CONFIG (nolock)  where COD_FILIAIS = '${COD_FILIAIAS}'`;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    const achou = recordset.rowsAffected[0]
                    const branch = recordset.recordset[0]
                    const box = null;




                    // if (user)
                    // conn.close();



                    var sqlQ1 = `SELECT * FROM GREENTOP..TB_FILIAIS_VITUAL_BOX (nolock) where ID_FILIAIS_CONFIG  = ${branch.ID_FILIAIS_CONFIG}`;

                    var req1 = new sql.Request(conn);

                    req1.query(sqlQ1)
                        .then(function(recordset1) {

                            const b = recordset1.recordset

                            branch.rotas = b

                            res.json({ msg: 'Success', branch: branch, status: res.status });
                        }).catch({

                        })



                    // if (achou == 0) {


                    //     conn.close();
                    //     res.json({ msg: 'Usuário sem acesso!', data: [], status: res.status });

                    // } else {


                    //     conn.close();
                    //     res.json({ msg: 'Success', data: recordset.recordset[0], status: res.status });
                    // }

                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data : ' + err);
                });
        })
        .catch(function(err) {
            // console.log(err)
            conn.close();
            res.status(400).send(err);
        })


}


integracaoLogs.getSucursales = (req, res) => {
    conn.close();
    conn.connect()
        .then(function() {
            var sqlQ = `SELECT * from TB_SUCURSALES `;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    res.json(recordset.recordset);
                    conn.close();
                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data' + err);
                });
        })
        .catch(function(err) {
            conn.close();
            res.status(400).send(err);
        })

}


integracaoLogs.getZonasSucursales = (req, res) => {
    const cod_sucursal = req.params.cod_sucursal;

    conn.close();

    conn.connect()
        .then(function() {
            var sqlQ = `SELECT * from TB_SUCURSALES_ZONAS (nolock)  where cod_sucursal = ${cod_sucursal} `;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {
                    conn.close();
                    res.json(recordset.recordset);
                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data' + err);
                });
        })
        .catch(function(err) {
            conn.close();
            res.status(400).send(err);
        })
}

integracaoLogs.getVehiculosSucursales = (req, res) => {
    const cod_sucursal = req.params.cod_sucursal;
    conn.close();

    conn.connect()
        .then(function() {
            var sqlQ = `SELECT * from TB_SUCURSALES_VEHICULOS  where cod_sucursal = ${cod_sucursal} `;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    conn.close();
                    res.json(recordset.recordset);
                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data' + err);
                });
        })
        .catch(function(err) {
            conn.close();
            res.status(400).send(err);
        })
}


integracaoLogs.getServiciosRouter = (req, res) => {
    const cod_router = req.params.cod_router;

    conn.close();

    conn.connect()
        .then(function() {

            // var sqlQ = sqlcommand;
            var sqlQ = `SELECT * from TB_INTEGRACION_SERVICIOS (nolock) where cod_router = ${cod_router} `;

            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    conn.close();
                    res.json(recordset.recordset);
                })
                .catch(function(err, status) {
                    conn.close();
                    res.status(400).send('error get data' + err);
                });
        })
        .catch(function(err) {
            conn.close();
            res.status(400).send(err);
        })
}


integracaoLogs.getRouters = (req, res) => {
    conn.close();
    const cod_sucursal = req.params.COD_SUCURSAL;

    conn.connect()
        .then(function() {

            var sqlQ = `SELECT A.COD_ROUTER, A.IDENT_ROUTER,A.FECHA_CREA ,B.* 
                    from TB_INTEGRACION_SCGR A(nolock)
                    inner join  TB_SUCURSALES B (nolock) 
                        ON A.COD_SUCURSAL = B.COD_SUCURSAL  WHERE A.COD_SUCURSAL = ${cod_sucursal} `;


            var req = new sql.Request(conn);

            req.query(sqlQ)
                .then(function(recordset) {

                    conn.close();
                    res.json(recordset.recordset);
                })
                .catch(function(err, ) {
                    conn.close();
                    res.status(401).send('error get data' + status);
                });
        })
        .catch(function(err) {

            conn.close();
            res.status(401).send(err);
        })


};

integracaoLogs.put_clear_cajas = (req, res) => {

    const { headers, body, route } = req;

    if (conn._connecting == true) {

        conn.close();

    }


    conn.connect()
        .then(function() {

            body.forEach(function(item) {

                const sqlQ = `
                UPDATE a SET  
                    a.VEHICULE_PLACA               =   null
                    ,a.SERVICIOS_SECUENCIA_ENTREGA  =   null    
                    ,a.ZONA                         =   null
                    ,a.VEHICULO_PLACA               =   null
                FROM  TB_INTEGRACION_SERVICIOS  a  
                WHERE ID_SERVICIO = ${item.ID_SERVICIO} `

                // console.log(sqlQ) ;

                var req = new sql.Request(conn);

                req.query(sqlQ)
                    .then(function(result) {

                        conn.close();
                        //res.json(result.rowsAffected);
                    })
                    .catch(function(err, status) {
                        conn.close();
                        res.status(400).send('error get data' + err);
                    });
            })
            res.status(200).json({ msg: 'update success' });
        })
};

integracaoLogs.putRota = (req, res) => {
    const { headers, body, route } = req;


    conn.close();

    conn.connect()
        .then(function() {


            body.forEach(function(item) {

                const sqlQ = `
                    UPDATE a SET  
                        a.ZONA  = ${item.ZONA}
                    FROM  TB_INTEGRACION_SERVICIOS  a  
                    WHERE ID_SERVICIO = ${item.ID_SERVICIO} `

                // console.log(sqlQ) ;

                var req = new sql.Request(conn);

                req.query(sqlQ)
                    .then(function(result) {

                        conn.close();
                        //res.json(result.rowsAffected);
                    })
                    .catch(function(err, status) {
                        conn.close();
                        res.status(400).send('error get data' + err);
                    });
            })

        })
        .catch(function(err) {
            conn.close();
            res.status(400).send('error get data fora');
        })


    //console.log(`Numero do serviço que vai ser dado update ${item.ID_SERVICIO} para a rota ${item.ZONA}`)
    //  item.SERVICIOS_CODIGO



    res.status(200).send()
    return

    try {
        conn.close();

        conn.connect()
            .then(function() {

                const sqlQ = `
                UPDATE a set  
                    a.VEHICULO_PLACA  = 'emf-8335' 
                FROM  TB_INTEGRACION_SERVICIOS  a  
                WHERE SERVICIOS_CODIGO = 6728344 `

                var req = new sql.Request(conn);

                req.query(sqlQ)
                    .then(function(result) {

                        conn.close();
                        res.json(result.rowsAffected);
                    })
                    .catch(function(err, status) {
                        conn.close();
                        res.status(400).send('error get data' + err);
                    });
            })
            .catch(function(err) {
                conn.close();
                res.status(400).send('error get data fora');
            })

    } catch (error) {
        conn.close();

    }
};


integracaoLogs.putServiciosReturn = (req, res) => {
    const id = req.params.servicios_codigo;
    const servicios = req.body


    try {
        conn.close();

        conn.connect()
            .then(function() {

                const sqlQ = `update a set  
                a.SERVICIOS_SECUENCIA_ENTREGA  =1,
                a.VEHICULO_PLACA  = 'emf-8335' 
            from  TB_INTEGRACION_SERVICIOS  a  
            where SERVICIOS_CODIGO = 6728344 `

                var req = new sql.Request(conn);

                req.query(sqlQ)
                    .then(function(result) {

                        conn.close();
                        res.json(result.rowsAffected);
                    })
                    .catch(function(err, status) {
                        conn.close();
                        res.status(400).send('error get data' + err);
                    });
            })
            .catch(function(err) {
                conn.close();
                res.status(400).send('error get data fora');
            })
    } catch (error) {
        res.json(error)
    } finally {
        res.json('finalizou')
            // console.log('dfsdfkjs')
    }



}


//#region   Envoo e retorno routeasy

integracaoLogs.postProcessaRetorno = async(req, res) => {

    try {


        const route = req.body.routing.name.split('-')
        const first_version = req.body.routing.data.first_version
        const site = req.body.routing.site
        const member = req.body.routing.member
        const cod_roteirizacao = route[0]
        const cod_rota = route[1]
        const parse = parse_retorno_routeasy(req)


        processaRetornoJson(JSON.stringify(req.body))

        res.send(JSON.stringify({ msg: 'Retorno processado ' }))


    } catch (err) {

        res.json(err)

    }


}

integracaoLogs.postRetornoRouteasy = async(req, res) => {

    try {


        const route = req.body.routing.name.split('-')
        const first_version = req.body.routing.data.first_version
        const site = req.body.routing.site
        const member = req.body.routing.member
        const cod_roteirizacao = route[0]
        const cod_rota = route[1]
        const parse = parse_retorno_routeasy(req)

        console.log('entrou')




        // const host = '190.248.148.243'
        // const psw = 'Solistica2020'
        // const user = 'RouteEasy'
        // const database = 'RouteEasy'

        // const config = {
        //     user: user,
        //     password: psw,
        //     server: host,
        //     database: database,
        //     port: 2433
        //     ,
        //     pool: {
        //         max: 2,
        //         min: 0,
        //         idleTimeoutMillis: 3000
        //     }
        // }

        //     const pool = await sql.connect(config)

        //     // Stored procedure
        //     const result2 = await pool.request()
        //         .input('COD_ROUTER', sql.VarChar(sql.MAX), cod_roteirizacao)
        //         .input('ZONA', sql.VarChar(sql.MAX), cod_rota)
        //         .input('JSON', sql.VarChar(sql.MAX), JSON.stringify(req.body) )
        //         .input('JSON_PARSE', sql.VarChar(sql.MAX), JSON.stringify(req.body))
        //         .input('TOKEN', sql.VarChar(sql.MAX), first_version)
        //         .input('TIPO', sql.Char(1), 'R')
        //         .input('SITE', sql.VarChar(sql.MAX), site)
        //         .execute('SP_SAVE_JSON_ROTEIRIZACAO_PAYLOAD')

        //     console.log(result2)

        //    await pool.close();

        SaveJson(cod_roteirizacao, cod_rota, JSON.stringify(req.body), JSON.stringify(parse), first_version, 'R', site, member)


        // const data = new Date();

        // const dataFormatada =          ("0000" + ((data.getFullYear()))).slice(-4) 
        // + "-" 
        // + ("00" + ((data.getMonth()+1 ))).slice(-2) 
        // + "-" 
        // + ("00" + ((data.getDay()+1 ))).slice(-2) 
        // + "T" 
        // + data.getHours()  
        // + data.getMinutes(); 

        //const nomearquivo = dataFormatada  +"-"+ req.body._id + ".json"
        //console.log(nomearquivo)

        // fs.writeFile(`src/json/${nomearquivo}`, JSON.stringify(req.body) , function(err) {
        //     if(err) {
        //         console.log(err);
        //     } else {
        //         console.log("The file was saved!");
        //     }
        // }); 


        res.send(JSON.stringify({ msg: 'processado : ' }))
            //res.json('Salvo')

    } catch (err) {

        res.json(err)
            //pool.close();

    }


}


integracaoLogs.postEnvioRouteasy = async(req, res, next) => {


    try {
        // url: http://company.routeasy.com.br/
        // login: solistica.colombia@routeasy.com.br
        // Senha: ASDFasdf
        // Api key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjVmM2MwODM2NTUwMmE2MTEwNTkzYjdlYyIsInRpbWVzdGFtcCI6MTU5ODQ2OTA2OTcyNH0.tAqrpaHSPp6s5iMOevObBkVLfxnn4tT4MZ2HxsWu7uw  

        const api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjVmM2MwODM2NTUwMmE2MTEwNTkzYjdlYyIsInRpbWVzdGFtcCI6MTU5ODQ2OTA2OTcyNH0.tAqrpaHSPp6s5iMOevObBkVLfxnn4tT4MZ2HxsWu7uw'
        const ulr = 'http://company.routeasy.com.br/group/create/2?api_key='

        const site = "5f3c08365502a6110593b7f7"
        req.body.site = site
        const postData = req.body;

        const route = postData.name.split('-')
        const cod_roteirizacao = route[0]
        const cod_rota = route[1]
            //  console.log(postData)

        // res.json(ulr + api_key);
        // Requisições POST, note há um parâmetro extra indicando os parâmetros da requisição
        let emailFetch = await axios.post(ulr + api_key, req.body, {
                headers: {
                    // Overwrite Axios's automatically set Content-Type
                    'Content-Type': 'application/json'
                }
            })
            .then(function(response) {

                // console.log( response.data.token)

                conn.close();
                conn.connect()
                    .then(function() {
                        const transaction = new sql.Transaction(conn)
                        transaction.begin(err => {
                            // ... error checks

                            //   console.log(parse[0])
                            const { usuario } = req.body;

                            const request = new sql.Request(transaction)
                            request.query("insert into TB_JSON_PAYLOAD ( cod_router ,zona, json,JSON_PARSE, TOKEN ,TIPO, dt_created , LOGIN ) values ('" + cod_roteirizacao + "','" + cod_rota + "','" + JSON.stringify(req.body) + "','" + JSON.stringify(req.body) + "','" + response.data.token + "','E' , getdate(),'" + JSON.stringify(req.body.usuario.replace('""', '')) + "')", (err, result) => {
                                // ... error checks



                                transaction.commit(err => {
                                    conn.close();
                                    // ... error checks

                                    // console.log("Transaction committed.")
                                    res.json({ msg: 'Token de retorno do envio', token: response.data.token })
                                        // res.json('Enviado com sucesso')
                                })
                            })
                        })
                    })
                    .catch(function(err) {
                        conn.close();
                        res.status(400).json('error get data fora');
                    })







                // res.json( { msg:'Token de retorno do envio' ,  token:response.data.token} )
            });

        // res.send('sucesso')

    } catch (error) {

        res.json(error.message)
            // next(error);

    }

}

//#endregion

integracaoLogs.getCron = (req, res) => {

    // Obtém a data/hora atual
    var data = new Date();

    // Guarda cada pedaço em uma variável
    var dia = data.getDate(); // 1-31
    var dia_sem = data.getDay(); // 0-6 (zero=domingo)
    var mes = data.getMonth(); // 0-11 (zero=janeiro)
    var ano2 = data.getYear(); // 2 dígitos
    var ano4 = data.getFullYear(); // 4 dígitos
    var hora = data.getHours(); // 0-23
    var min = data.getMinutes(); // 0-59
    var seg = data.getSeconds(); // 0-59
    var mseg = data.getMilliseconds(); // 0-999
    var tz = data.getTimezoneOffset(); // em minutos

    // Formata a data e a hora (note o mês + 1)
    var str_data = dia + '/' + (mes + 1) + '/' + ano4;
    var str_hora = hora + ':' + min + ':' + seg;

    // Mostra o resultado
    try {
        res.status(200).send(`Hoje ${dia}/${mes}/${ano4} às ${str_hora} rodou o metodo Cron GetCron `);
        console.log(`Hoje ${dia}/${mes}/${ano4} às ${str_hora} rodou o metodo Cron GetCron `)
    } catch (error) {
        res.status(500).send(`${error} metodo: getCron`);
        console.log(error)

    }




}





module.exports = integracaoLogs;


//#region  functions (parse_retorno_routeasy)
function verificar(arr, procurar) {
    var chave = procurar[0];
    var valor = procurar[1];
    return !!arr.filter(function(el) {
        return el[chave] == valor;
    }).length;
}

function parse_retorno_routeasy(req) {


    const route = req.body.routing.name.split('-')
    const site = req.body.routing.site
    const cod_roteirizacao = route[0]
    const cod_rota = route[1]
    const rotas = req.body.results.routes
    const retornos = [];
    const routes = req.body.results.routes
    const paulo = req.body.routing.data.services
    const paulo1 = req.body.results.routes


    routes.forEach(route => {

        const rota = {
            cod_roteirizacao: cod_roteirizacao,
            _id: route._id,
            veiculo: route.name,
            km_distanc: route.distance,
            servicos: []
        }

        route.delivery_order.forEach(serv => {

            if (serv.type != 'depot') {
                const servico = {
                    _id: serv._id,
                    location: serv.location,
                    ordem: serv.order,
                    distance: serv.distance,
                    duration: serv.duration,
                    documento: undefined

                }



                route.directions.filter(function(obj) {

                    if (obj.end.delivery._id == servico.location) {
                        servico.documento = obj.end.delivery.order_number

                    }

                });



                rota.servicos.push(servico);
            }
        })



        retornos.push(rota)



        // const  verifica  = verificar(retornos, ['veiculo', rota.rota])

        // console.log(verifica)
        //  if(verifica==false){
        //      console.log(`não achou ${rota.veiculo}`)
        //      retornos.push(rota)
        //  }

        // const achou    =  retornos.indexOf(rota); 
        // if(achou===1){
        //     console.log('ja existe')
        // }else{
        //     retornos.push(rota)

        // }

    })


    //salvarnew(retornos) // retirado devido ao erro que dava ao salvar etentar atualizar od dados da tabelas aonde fica os serviços
    // RetornRouteasyIntegration(retornos)


    return retornos

    //#region  comentado  antiga fomra de atualizar os dados da routeasy retorno colombia

    return
    routes.forEach(function(item) {
        var veiculoAux = ''

        const delivery_order = item.delivery_order // aonde tem  o sequenciamento  no campo "order"  e tem referencia com o campo "location" com array 
        const directions = item.directions

        const localtions = []

        delivery_order.forEach(function(order) {



            if (order.type != "depot") {


                const location = {
                    location: order.location,
                    order: order.order,
                    distance: order.distance,
                    duration: order.duration,
                    arrival_time: order.arrival_time,
                    departure_time: order.departure_time
                }

                directions.forEach(function(item) {

                    // console.log(item ,'paulo')
                    if (item.end.delivery._id == order.location) {

                        location.lat = item.end.delivery.address.geocode.lat
                        location.lng = item.end.delivery.address.geocode.lng
                        location.type = item.end.delivery.type
                        location.service_type = item.end.delivery.service_type
                        location.order_number = item.end.delivery.order_number
                        location.name = item.end.delivery.name
                        location.address_input = item.end.delivery.address_input



                        // }

                    }
                })

                localtions.push(location)
            }

        })

        const rotorno = {
            _id: item._id,
            cod_roteirizacao: cod_roteirizacao,
            cod_rota: cod_rota,
            first_version: req.body.routing.data.first_version,
            ident_veiculo: item.name,
            kms: item.distance,
            locations: localtions,
            site: site
        }

        retornos.push(rotorno)
    })

    RetornRouteasyIntegration(retornos)


    return retornos

    //#endregion
}


function processaRetornoJson(_JSON) {
    conn.close();
    conn.connect()
        .then(function() {
            //retornos.forEach(ret => {
            const transaction = new sql.Transaction(conn)
            transaction.begin(err => {
                const request = new sql.Request(transaction)
                request.query(`Exec  SP_RETORNO_JSON_ROTEIRIZACAO_ROUTEASY '${_JSON}'`, (err, result) => {

                    transaction.commit(err => {
                        conn.close();
                        console.log("Transaction committed." + err)
                    })
                })

            })

        })
        .catch(function(err) {
            conn.close();
            console.log('error get data fora')
        })

}

function SaveJson(COD_ROUTER, ZONA, _JSON, _JSON_PARSE, TOKEN, TIPO, SITE, MEMBER) {
    conn.close();
    conn.connect()
        .then(function() {
            //retornos.forEach(ret => {
            const transaction = new sql.Transaction(conn)
            transaction.begin(err => {
                // ... error checks
                const request = new sql.Request(transaction)

                const data = new Date();

                const dataFormatada = ("0000" + ((data.getFullYear()))).slice(-4) +
                    "-" +
                    ("00" + ((data.getMonth() + 1))).slice(-2) +
                    "-" +
                    ("00" + ((data.getDay() + 1))).slice(-2) +
                    " " +
                    ("00" + ((data.getHours()))).slice(-2) +
                    ":" +
                    (((data.getMinutes())))


                request.query(`
                        INSERT INTO  TB_JSON_PAYLOAD 
                            ( COD_ROUTER
                            ,ZONA
                            ,JSON
                            ,JSON_PARSE
                            ,DT_CREATED  
                            ,TOKEN
                            ,TIPO
                            ,SITE
                            ,LOGIN)
                        values( 
                            '${COD_ROUTER}', 
                            '${ZONA}',
                            '${_JSON}',
                            '${_JSON_PARSE}',
                            '${dataFormatada}',
                            '${TOKEN}',
                            '${TIPO}',
                            '${SITE}',
                            '${MEMBER}')`, (err, result) => {



                    console.log(`  INSERT INTO  TB_JSON_PAYLOAD ( COD_ROUTER,ZONA,DT_CREATED  ,TOKEN,TIPO, SITE)  values( '${COD_ROUTER}', '${ZONA}',  '${dataFormatada}','${TOKEN}','${TIPO}','${SITE}')`)




                    transaction.commit(err => {



                        conn.close();
                        // ... error checks

                        console.log("Transaction committed." + err)
                            // res.json({ msg: 'Token de retorno do envio', token: response.data.token })
                            // res.json('Enviado com sucesso')
                    })
                })



            })

            //})
        })
        .catch(function(err) {
            conn.close();
            console.log('error get data fora')
                // res.status(400).json('error get data fora');
        })
}






function salvarnew(retornos) {
    conn.close();
    conn.connect()
        .then(function() {
            retornos.forEach(ret => {
                const transaction = new sql.Transaction(conn)
                transaction.begin(err => {
                    // ... error checks
                    const request = new sql.Request(transaction)

                    console.log(ret.veiculo)

                    if (ret.veiculo === 'BJF020') {
                        ret.servicos.forEach(async serv => {

                            request.query(`update TB_INTEGRACION_SERVICIOS set SERVICIOS_SECUENCIA_ENTREGA = ${serv.ordem} , VEHICULE_PLACA = '${ret.veiculo}',  VEHICULO_PLACA = '${ret.veiculo}'  WHERE SERVICIOS_CODIGO = '${serv.documento}' AND COD_ROUTER = ${ret.cod_roteirizacao} `, (err, result) => {
                                // ... error checks


                                console.log(`update TB_INTEGRACION_SERVICIOS set SERVICIOS_SECUENCIA_ENTREGA = ${serv.ordem} , VEHICULE_PLACA = '${ret.veiculo}',  VEHICULO_PLACA = '${ret.veiculo}'  WHERE SERVICIOS_CODIGO = '${serv.documento}' AND COD_ROUTER = ${ret.cod_roteirizacao} `)

                                transaction.commit(err => {
                                    conn.close();
                                    // ... error checks

                                    console.log("Transaction committed.")
                                        // res.json({ msg: 'Token de retorno do envio', token: response.data.token })
                                        // res.json('Enviado com sucesso')
                                })
                            })
                        })
                    }
                })

            })
        })
        .catch(function(err) {
            conn.close();
            console.log('error get data fora')
                // res.status(400).json('error get data fora');
        })
}


function RetornRouteasyIntegration(retornos) {



    //console.log( retornos)

    conn.close();

    conn.connect()
        .then(function() {

            try {

                retornos.forEach(ret => {


                    if (ret.veiculo === 'BJF020') {



                        ret.servicos.forEach(async serv => {

                            console.log(`Atualizado o documento :  ${serv.documento} na ordem : ${serv.ordem} da router: ${ret.cod_roteirizacao}`)

                            const sqlQ = `
                                                UPDATE a SET  
                                                    a.SERVICIOS_SECUENCIA_ENTREGA  =   '${serv.ordem}'   
                                                    ,a.VEHICULE_PLACA               =   '${ret.veiculo}'
                                                    ,a.VEHICULO_PLACA               =   '${ret.veiculo}'
                                                    FROM  TB_INTEGRACION_SERVICIOS  a  
                                                WHERE SERVICIOS_CODIGO = '${serv.documento}'
                                                    AND COD_ROUTER = ${ret.cod_roteirizacao} `

                            var req = new sql.Request(conn);

                            await req.query(sqlQ)
                                .then(function(result) {
                                    //console.log(result)
                                    conn.close();
                                })
                                .catch(function(err, status) {
                                    console.log('error get data pf :' + err)
                                    conn.close();
                                    // res.status(400).send('error get data' + err);
                                });
                        })

                    }

                    // veiculoAux = retornos[0].ident_veiculo



                })


                // retornos[0].locations.forEach(function (ret) {

                //              const sqlQ = `
                //              UPDATE a SET  
                //                  a.SERVICIOS_SECUENCIA_ENTREGA  =   '${ret.order}'   
                //                  ,a.VEHICULE_PLACA               =   '${retornos[0].ident_veiculo}'
                //                  ,a.VEHICULO_PLACA               =   '${retornos[0].ident_veiculo}'
                //                  FROM  TB_INTEGRACION_SERVICIOS  a  
                //              WHERE SERVICIOS_CODIGO = '${ret.order_number}'
                //                  AND COD_ROUTER = ${retornos[0].cod_roteirizacao} `

                //              var req = new sql.Request(conn);

                //              req.query(sqlQ)
                //                  .then(function (result) {
                //                      //console.log(result)
                //                      conn.close();
                //                  })
                //                  .catch(function (err, status) {
                //                      //console.log('error get data pf :' + err)
                //                      conn.close();
                //                      // res.status(400).send('error get data' + err);
                //                  });

                //                  veiculoAux = retornos[0].ident_veiculo




                // })

            } catch (error) {
                console.log('erro:' + error)

            }


        })
}




//#endregion