document.addEventListener("deviceready", function () {
    db = window.sqlitePlugin.openDatabase({name: "cfe.db"});
}, false);

//confuguracion app  
var 

main = function( $ionicPlatform ) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }

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
                            ")";

        db.transaction(function ( tx ) {
            tx.executeSql( table_server );
            tx.executeSql( table_sesion );
        }, function ( e ) {
            alert( 'Error sqlite: ' + e );
            return true;
        });        
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

 
    $urlRouterProvider.otherwise("/login");
},

nameApp =   
    angular
    .module('starter', ['ionic', 'ngCordova','ngMessages'])
    .run( main );

//configuracion de ventanas con controladores
nameApp.config( config );
