var 

controlIpServer = function ( $scope, $state, $cordovaSQLite, $ionicHistory, $ionicLoading ) {
    $scope.ip = {
        ip1: '',
        ip2: '',
        ip3: '',
        ip4: ''
    }

    /**********************************************
     * fill data boxes
     *********************************************/
    var 
        regExpIP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9s][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
        serverAddressDB = sigesop.ipServidor || '';

    // Si es una IP fragmentamos la cadena
    if ( regExpIP.test( serverAddressDB ) ) {
        var arr = serverAddressDB.splitParametros( '.' );
        
        $scope.ip.ip1 = arr[0];
        $scope.ip.ip2 = arr[1];
        $scope.ip.ip3 = arr[2];
        $scope.ip.ip4 = arr[3];
    }
        
    else $scope.dominio = serverAddressDB;

    // click event for get data from views
    $scope.getServer = function ( form, data ) {
        var serverAddress;

        if ( angular.isObject( data ) ) {
            serverAddress = data.ip1 + '.' + 
                            data.ip2 + '.' + 
                            data.ip3 + '.' + data.ip4;
        }
        else serverAddress = data;

        db.transaction(function ( tx ) {
            tx.executeSql( 'DELETE FROM server', [], function ( tx, data ) {});

            var 

            //direccion para conexion ajax
            rootServer= "http://" + serverAddress + "/ajax/sistema/",
            sql = "INSERT INTO server (server_address, root_server) VALUES (?,?)";

            tx.executeSql( sql, [serverAddress,rootServer], function ( tx, data ) {
                sigesop.ipServidor = serverAddress;
                sigesop.raizServidor = rootServer;
                alert("OK REGISTRO INSERTADO (SERVER)");
            });
        }, function ( e ) {
            alert( 'Error al insertar servidor.' )
            return true;
        });
    };

    // click event for back button on 
    $scope.backButton = function ( form ) {
        $state.go('login');
        
        // mostrar loading 
        // $ionicLoading.show({
        //     templateUrl:"view/templates/loading.html",
        //     duration: 5000
        // });
    };
}

nameApp.controller( 'controlIpServer', controlIpServer );

