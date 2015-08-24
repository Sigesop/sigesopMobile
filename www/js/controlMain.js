nameApp.controller('controlMain', function ( $scope, $state ,$ionicPopup, $timeout, $ionicSideMenuDelegate, $ionicHistory, $http ) {
	$scope.items = [];

	$scope.toggleLeft = function (){
		$ionicSideMenuDelegate.toggleLeft();
	};

	$scope.cerrarSesion = function(form) {
		var sql =
		"DELETE FROM sesion WHERE state = 1";
		// "UPDATE sesion SET state = 0 WHERE state = 1";
		db.transaction(function ( tx ){
			tx.executeSql( sql, []);
			window.localStorage.sesion = {
				usuario: null,
				password: null
			}
			$state.go('login');
		}, function ( e ){
			alert( 'Error sql cerrar sesion. ' + e );
			return true;
		});
  	}; 

  	$scope.cambiarUsuario = function(form) {
		sigesop.alerts({
	    	title: 'ADVERTENCIA!!!',
      		subtitle: 'Lo sentimos<br>Por el momento no esta disponible...</br>',
	      	time: '3000',
	      	popUp: $ionicPopup,
	      	timeOut: $timeout
	    });
  	}; 

	// Lanzamiento de Ajax al servidor
	sigesop.query( $http, {
		data: { usuario: 'admin' },		
		class: 'mantenimiento',
		query: 'obtenerOrdenTrabajo',
		queryType: 'sendGetData',
		success: function ( data ) {
			$scope.imagen = sigesop.icono;
		  	$scope.items = data;

		  	// $scope.items = [
		   //  	{ id_prog_mtto: 1, nombre_mantenimiento: 'MANTENIMIENTO SEMESTRAL', trabajo_solicitado: 'REVISIÓN DE ESTADO', numero_orden: '1V-01MS', imagen: sigesop.icono },
		   //  	{ id_prog_mtto: 2, nombre_mantenimiento: 'MANTENIMIENTO SEMESTRAL', trabajo_solicitado: 'REVISIÓN DE ESTADO', numero_orden: '1V-02MS', imagen: sigesop.icono },
		   //  	{ id_prog_mtto: 3, nombre_mantenimiento: 'MANTENIMIENTO SEMESTRAL', trabajo_solicitado: 'REVISIÓN DE ESTADO', numero_orden: '1V-03MS', imagen: sigesop.icono },
		   //  	{ id_prog_mtto: 4, nombre_mantenimiento: 'MANTENIMIENTO SEMESTRAL', trabajo_solicitado: 'REVISIÓN DE ESTADO', numero_orden: '1V-04MS', imagen: sigesop.icono }
		  	// ];
		},
		error: function ( data ) {
			alert( 'Error ajax: obtenerOrdenTrabajo. ' + data );
		}
	});  
});