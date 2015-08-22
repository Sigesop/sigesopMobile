var 

controlIpServer = function ( $scope, $state, $cordovaSQLite, $ionicHistory,$ionicLoading) {

    // alert(sigesop.getOwnPropertyNames($ionicHistory.backView()));
    /**********************************************
     * Consulta a la tabla [server] para configurar
     * la direccion del servidor ajax
     *********************************************/
    // var sql = "SELECT server_address, root_server FROM server";
    // db.transaction(function ( tx ) {
    //     tx.executeSql( sql, [], function ( tx, data ) {
    //         var serverAddressDB = data.rows.item(0).server_address;
    //         sigesop.ipServidor = serverAddressDB;
    //         sigesop.raizServidor = 'http://' + serverAddressDB + '/ajax/sistema/';
    //         $scope.serverAddress = serverAddressDB;
    //     });
    // }, function ( e ) {

    // });

    // var sql = "SELECT server_address, root_server FROM server";
    // $cordovaSQLite.execute( db, sql )
    // .then(function ( data ){
    //     var serverAddressDB = data.rows.item(0).server_address;
    //     sigesop.ipServidor = serverAddressDB;
    //     sigesop.raizServidor = 'http://' + serverAddressDB + '/ajax/sistema/';
    //     $scope.serverAddress = serverAddressDB;
    // }, function ( err ){

    // });    

    $scope.getIp = function ( form, serverAddress ) {
        var

        //funcion si la eliminacion de la base de datos es correcta
        deleteServer = function( res ) {
            alert("BASE DE DATOS LIMPIA");

            var 
            //generar ip concatenada
            // ipRoot = ip.ip1 + "." + ip.ip2 + "." + ip.ip3 + "." + ip.ip4,

            //direccion para conexion ajax
            rootServer= "http://" + serverAddress + "/ajax/sistema/",

            //funcion si el registro se inserto bien en la tabla server
            insertServer = function(res) {
                alert("OK REGISTRO INSERTADO (SERVER)");
            },

            //funcion si hubo errores al insertar en la tabla server
            errorServer = function (err) {
                alert("ERROR AL INSERTAR (SERVER)");

                $scope.serverAddress = '';  
            }, 

            //insercion de datos en la base de datos
            sql = "INSERT INTO server (server_address, root_server) VALUES (?,?)";
            $cordovaSQLite.execute(db, sql, [serverAddress,rootServer]).then( insertServer, errorServer );
        }, 

        //funcion si hubo erres al eliminar la base de datos
        errorServer = function (err) {
            alert("ERROR ELIMINADO BASE")
        },

        //eliminamos datos de la tabla server para que siempre los registros sean nuevos
        //*******************************************************************************
        sql = "DELETE FROM server";    
        $cordovaSQLite.execute( db, sql ).then( deleteServer , errorServer );
    };

     $scope.backButton = function(form) {
        $state.go('login');
        
        // mostrar loading 
        // $ionicLoading.show({
        //     templateUrl:"view/templates/loading.html",
        //     duration: 5000
        // });

    };


}

nameApp.controller( 'controlIpServer', controlIpServer );

