nameApp.controller('controlMain', function ( $scope, $state ,$ionicPopup, $timeout, $ionicSideMenuDelegate, $ionicHistory, $http ) {
	$scope.items = [];
	$scope.sesion = {
		usuario: '',
		password: ''
	};

	$scope.init = function () {
		$scope.sesion = sigesop.sesion;

		if ( sigesop.sesion.usuario && sigesop.networkState ) {
			sigesop.query( $http, {
				data: { usuario: sigesop.sesion.usuario },		
				class: 'mantenimiento',
				query: 'obtenerOrdenTrabajo',
				queryType: 'sendGetData',
				success: function ( data ) {
					$scope.imagen = sigesop.icono;
				  	$scope.items = data;
				},
				error: function ( data ) {
					alert( 'Error ajax: obtenerOrdenTrabajo. ' + data );
				}
			});
		}
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
				sigesop.sesion = {};
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

  	$scope.init();
});