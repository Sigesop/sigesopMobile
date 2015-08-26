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

// AngularJS service for setting and retrieving strings or objects
angular.module( 'ionic.utils', [])
.factory( '$localStorage', ['$window', function( $window ) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            delete: function ( key ) {
                delete $window.localStorage[ key ];
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
}]);

//confuguracion app  
var 

main = function( $ionicPlatform, $state, $ionicHistory, $localStorage, $ionicLoading) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

        sigesop.loading = $ionicLoading.show({
            template: '<p class="load item-icon-center">LOADING <ion-spinner icon="lines"/></p>',
            duration: 3000
        });

        // $ionicHistory.clearHistory();
        // $ionicHistory.clearCache();

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

        table_orden_trabajo =
                       "CREATE TABLE IF NOT EXISTS orden_trabajo(" +
                            "id_prog_mtto            int unsigned PRIMARY KEY," +
                            "numero_orden            VARCHAR(30) NOT NULL," +
                            "id_aero                 VARCHAR(50) NOT NULL," +
                            "id_mantenimiento        VARCHAR(2) NOT NULL," +
                            "id_orden_trabajo        int unsigned NOT NULL," +

                            "nombre_mantenimiento    varchar(30) NOT NULL," +
                            "duracion                INT UNSIGNED NOT NULL," +
                            "magnitud_duracion       CHAR(1) NOT NULL," +
                            "fecha_inicial           DATE NOT NULL," +
                            "fecha_final             DATE NOT NULL," +
                            "trabajo_solicitado      TEXT NOT NULL" +
                        ")",

        user_active =    "SELECT user, password FROM sesion WHERE state = 1",

        server_address = "SELECT server_address, root_server FROM server";

        db.transaction(function ( tx ) {
            /**********************************************
             * Creacion de las tablas de datos
             *********************************************/
            tx.executeSql( table_server );
            tx.executeSql( table_sesion );
            tx.executeSql( table_orden_trabajo );

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
                    $localStorage.setObject( 'sesion', {
                        usuario: res.rows.item(0).user,
                        password: res.rows.item(0).password
                    });
                    $state.go('main');                    
                } 

                sigesop.loading.hide();
            });
        }, function ( e ) {
            alert( 'Error en creacion de tablas. ' + e );
            return true;
        });
    });
},

config = function ( $stateProvider, $urlRouterProvider, $httpProvider) {
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
            controller: 'controlLogin',
            onEnter: function ( $ionicLoading ) {
                // $ionicLoading.show({
                //     template: '<p class="load item-icon-center">LOADING <ion-spinner icon="lines"/></p>',
                //     duration: 3000
                // });
            }
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
    .module('starter', ['ionic', 'ionic.utils', 'ngCordova','ngMessages'])
    .run( main );

//configuracion de ventanas con controladores
nameApp.config( config );