// extend javascript native functions for [String]
angular.extend( String.prototype,
    {
        flushChar: function ( character ) {
            return this && character ?
                this.replace( character, '' ) : '';
        },

        utf8_encode: sigesop.utf8_encode,

        utf8_decode: sigesop.utf8_decode,

        SHA1: function ( str ) {
            str = str || this;
            //  discuss at: http://phpjs.org/functions/sha1/
            // original by: Webtoolkit.info (http://www.webtoolkit.info/)
            // improved by: Michael White (http://getsprink.com)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //    input by: Brett Zamir (http://brett-zamir.me)
            //  depends on: utf8_encode
            //   example 1: sha1('Kevin van Zonneveld');
            //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

            var rotate_left = function(n, s) {
                var t4 = (n << s) | (n >>> (32 - s));
                return t4;
            };

            /*var lsb_hex = function (val) { // Not in use; needed?
                var str="";
                var i;
                var vh;
                var vl;

                for ( i=0; i<=6; i+=2 ) {
                    vh = (val>>>(i*4+4))&0x0f;
                    vl = (val>>>(i*4))&0x0f;
                    str += vh.toString(16) + vl.toString(16);
                }
                return str;
            };*/

            var cvt_hex = function(val) {
                var str = '';
                var i;
                var v;

                for (i = 7; i >= 0; i--) {
                    v = (val >>> (i * 4)) & 0x0f;
                    str += v.toString(16);
                }
                return str;
            };

            var blockstart;
            var i, j;
            var W = new Array(80);
            var H0 = 0x67452301;
            var H1 = 0xEFCDAB89;
            var H2 = 0x98BADCFE;
            var H3 = 0x10325476;
            var H4 = 0xC3D2E1F0;
            var A, B, C, D, E;
            var temp;

            str = this.utf8_encode(str);
            var str_len = str.length;

            var word_array = [];
            for (i = 0; i < str_len - 3; i += 4) {
                j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
                word_array.push(j);
            }

            switch (str_len % 4) {
                case 0:
                    i = 0x080000000;
                    break;
                case 1:
                    i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
                    break;
                case 2:
                    i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
                    break;
                case 3:
                    i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
                    8 | 0x80;
                    break;
            }

            word_array.push(i);

            while ((word_array.length % 16) != 14) {
                word_array.push(0);
            }

            word_array.push(str_len >>> 29);
            word_array.push((str_len << 3) & 0x0ffffffff);

            for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
                for (i = 0; i < 16; i++) {
                    W[i] = word_array[blockstart + i];
                }
                for (i = 16; i <= 79; i++) {
                    W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
                }

                A = H0;
                B = H1;
                C = H2;
                D = H3;
                E = H4;

                for (i = 0; i <= 19; i++) {
                    temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 20; i <= 39; i++) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 40; i <= 59; i++) {
                    temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 60; i <= 79; i++) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                H0 = (H0 + A) & 0x0ffffffff;
                H1 = (H1 + B) & 0x0ffffffff;
                H2 = (H2 + C) & 0x0ffffffff;
                H3 = (H3 + D) & 0x0ffffffff;
                H4 = (H4 + E) & 0x0ffffffff;
            }

            temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
            return temp.toLowerCase();
        },

        splitParametros: function ( del ) {
            if ( !this ) return [];

            var array = [],
                m = this.split( del );

            for( var i = 0, lon = m.length; i < lon; i++ ) array.push( m[ i ].trim() );
            return array;
        }
    }
);

document.addEventListener("deviceready", function () {
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
    
    db = window.sqlitePlugin.openDatabase({name: "cfe.db"});    
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

main = function( $ionicPlatform, $state, $ionicHistory, $ionicLoading, $rootScope, $cordovaNetwork ) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }        

        // sigesop.loading = $ionicLoading.show({
        //     template: '<p class="load item-icon-center">LOADING <ion-spinner icon="lines"/></p>',
        //     duration: 3000
        // });

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
                    sigesop.sesion = {
                        usuario: res.rows.item(0).user,
                        password: res.rows.item(0).password
                    }
                    $state.go('main');                 
                }

                else $state.go('login');

                // sigesop.loading.hide();
            });
        }, function ( e ) {
            alert( 'Error en creacion de tablas. ' + e );
            return true;
        });
    });

    // setting for network state
    document.addEventListener("deviceready", function () {
        // init state
        sigesop.networkState = $cordovaNetwork.isOnline();

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            sigesop.networkState = networkState;
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            sigesop.networkState = networkState;
        })
    }, false);
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
    // db.transaction(function ( tx ) {
    //     tx.executeSql( 'SELECT user FROM sesion WHERE state = 1', [], function ( res ) {
    //         if ( res.rows.length > 0 ) sigesop.root = '/main';
    //         else sigesop.root = '/login';
    //     });
    // }, function ( e ) {

    // });

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

    // $urlRouterProvider.otherwise( '/login' );
},

nameApp =   
    angular
    .module('starter', ['ionic', 'ionic.utils', 'ngCordova','ngMessages'])
    .run( main );

//configuracion de ventanas con controladores
nameApp.config( config );