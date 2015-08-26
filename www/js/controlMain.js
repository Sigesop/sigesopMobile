nameApp.controller('controlMain', function ( $scope, $state ,$ionicPopup, $timeout, $ionicSideMenuDelegate, $ionicHistory, $http, $localStorage ) {	
	$scope.items = [];
	$scope.sesion = {
		usuario: '',
		password: ''
	};

	$scope.init = function () {
		var sesion = $localStorage.getObject( 'sesion' );
		$scope.sesion = sesion;
		sigesop.query( $http, {
			data: { usuario: sesion.usuario },		
			class: 'mantenimiento',
			query: 'obtenerOrdenTrabajo',
			queryType: 'sendGetData',
			success: function ( data ) {
				$scope.imagen = sigesop.icono;
				// $scope.items = {};
			  	// $scope.items = data;

				var applyFn = function () {
					$scope.items = data;
				}

				if ($scope.$$phase) { // most of the time it is "$digest"
					applyFn();
				} else {
					$scope.$apply(applyFn);
				}

			  	// $scope.$apply();
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
	};

	$scope.toggleLeft = function (){
		$ionicSideMenuDelegate.toggleLeft();
	};

	var confirmarCierre = function() {
		var sql =
		"DELETE FROM sesion WHERE state = 1";
		// "UPDATE sesion SET state = 0 WHERE state = 1";
		db.transaction(function ( tx ){
			tx.executeSql( sql, [], function ( res ){
				$localStorage.delete( 'sesion' );
				$ionicHistory.clearHistory();
        		$ionicHistory.clearCache();
				$state.go('login');
			});
		}, function ( e ){
			alert( 'Error sql cerrar sesion. ' + e );
			return true;
		});
	};

	$scope.cerrarSesion = function(form) {
		$ionicPopup.confirm({
			title: 'Cerrar sesión',
			template: '¿Está usted seguro de cerrar sesión?',
			cancelText: 'Cancelar',
			okText: 'Aceptar'
		})
		.then(function(res) {
			if(res) confirmarCierre();
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
});