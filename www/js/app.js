document.addEventListener("deviceready", function () {
    db = window.sqlitePlugin.openDatabase({name: "cfe.db"});

    /* Propiedades de Tx
     * db
     * error
     * executes
     * fn
     * readOnly
     * success
     * txlock    
     */ 
    
    /* Propiedades de Res
     * insertId
     * rows
     * rowsAffected
     */
    
    sigesop.root = '';
}, false);

//confuguracion app  
var 

main = function( $ionicPlatform, $state, $ionicHistory ) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();

        /* creacion base de datos     
         * creacion modelo de tablas
         */
        var 

        table_server = "CREATE TABLE IF NOT EXISTS server(" +
                            "server_address   char(15)         primary key," + 
                            "root_server      varchar(100)" + 
                        ")",

        table_sesion =  "CREATE TABLE IF NOT EXISTS sesion(" +
                            "user          varchar(16)      primary key," + 
                            "password      char(50)," +
                            "state         boolean"+ 
                        ")",

        user_active =    "SELECT user, password FROM sesion WHERE state = 1",

        server_address = "SELECT server_address, root_server FROM server";

        db.transaction(function ( tx ) {
            /**********************************************
             * Creacion de las tablas de datos
             *********************************************/
            tx.executeSql( table_server );
            tx.executeSql( table_sesion );

            /**********************************************
             * Consulta a la tabla [server] para configurar
             * la direccion del servidor ajax
             *********************************************/
            tx.executeSql( server_address, [], function ( tx, res ) {
                if ( res.rows.length > 0 ) {
                    var serverAddressDB = res.rows.item(0).server_address;                    
                    // configuramos la libreria
                    sigesop.ipServidor = serverAddressDB;
                    sigesop.raizServidor = 'http://' + serverAddressDB + '/ajax/sistema/';
                }
            });

            /**********************************************
             * Consulta a la tabla [sesion] para configurar
             * el inicio automatico de sesion y guardar
             * [user, password] en la sesion local del navegador
             *********************************************/
            tx.executeSql( user_active, [], function ( tx, res ) {          
                if ( res.rows.length > 0 ) {
                    //guardamos usuario actual en navegador
                    window.localStorage.sesion = {
                        usuario: res.rows.item(0).user,
                        password: res.rows.item(0).password
                    }
                    $state.go('main');
                } 
            });
        }, function ( e ) {
            alert( 'Error en creacion de tablas. ' + e );
            return true;
        });

        // db.transaction(function ( tx ) {
        //     /**********************************************
        //      * Consulta a la tabla [sesion] para configurar
        //      * el inicio automatico de sesion y guardar
        //      * [user, password] en la sesion local del navegador
        //      *********************************************/
        //     var user_active =    "SELECT user, password FROM sesion WHERE state = 1";
        //     tx.executeSql( user_active, [], function ( tx, res ) {          
        //         if ( res.rows.length > 0 ) {
        //             //guardamos usuario actual en navegador
        //             window.localStorage.sesion = {
        //                 usuario: res.rows.item(0).user,
        //                 password: res.rows.item(0).password
        //             }
        //             sigesop.root = '/main';
        //         }

        //         else sigesop.root = '/login';

        //     });    
        // }, function ( e ) {
        //     alert( 'Error en ruteo. ' + e );
        //     return true;
        // });

    });
},

config = function ( $stateProvider, $urlRouterProvider, $httpProvider ) {
    /* Configuracion de QueryString para comunicacion ajax con PHP  
    */ 
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function ( data ) {
        return angular.isObject(data) && String(data) !== '[object File]' ? sigesop.param(data) : data;
    }];

    /* Configuracion de ruteo de transiciones
    */
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'view/view/login.html',
            controller: 'controlLogin'
        })
        .state('ipServer', {
            url: '/ipServer',
            templateUrl: 'view/view/ipServer.html',
            controller: 'controlIpServer'
        })
        .state('main', {
            url: '/main',
            templateUrl: 'view/view/main.html',
            controller: 'controlMain'
        });

    $urlRouterProvider.otherwise( '/login' );
},

nameApp =   
    angular
    .module('starter', ['ionic', 'ngCordova','ngMessages'])
    .run( main );

//configuracion de ventanas con controladores
nameApp.config( config );