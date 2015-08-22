var 

controlLogin = function ( $scope, $state, $http, $cordovaSQLite, $ionicHistory, $ionicPlatform) {
	$scope.datos = {
		username: '',
		password : '',
	}; 

	$scope.getDatos = function(form, datos) {
		if( !form.$valid ) {
			return -1;
		}
		//eliminar el historial de navegacion de la aplicacion
		//$ionicHistory.clearHistory();
  		//$ionicHistory.clearCache();
      	
      	//ir a la ventana main
		$state.go('main');

		/* Estructura de datos valido para iniciar
		 * sesion dentro del sistema
		 */
		// var data = {
		// 	usuario: {
		// 		valor: datos.username					
		// 	},

		// 	clave: {
		// 		valor: sigesop.SHA1( datos.password )
		// 	}
		// };

		// // Lanzamiento de Ajax al servidor
		// sigesop.query( $http, {
		// 	data: data,
		// 	type: 'POST',
		// 	class: 'sistema',
		// 	query: 'solicitudInicioSesion',
		// 	queryType: 'sendGetData',
		// 	success: function ( data ) {
		// 		if ( sigesop.isEmptyObject( data ) ) {
		// 			alert('Valor retornado del servidor es null');
					
		// 			// $.unblockUI(); ---> LE FALTA BLOQUEAR PANTALLA CON IONIC
		// 			return -1;		
		// 		} 
		
		// 		// CUANDO EL USUARIO NO ES VALIDO
		// 		if ( data.estado ) {
		// 			// FALTA TOAST CON IONIC
		// 			// sigesop.msg( '<br><center>Acceso Autorizado</center>', '', 'success' );
										
		// 			/* ENVIO A LA SIGUIENTE VISTA						
		// 			 */ 
					
		// 			$state.go('main');
		// 		} 

		// 		// CUANDO EL USUARIO NO ES VALIDO
		// 		else {
		// 			alert( 'Usuario inválido' );

		// 		}
		// 	},
		// 	error: function ( data ) {
		// 		alert( 'Error ajax: ' + data );
		// 	}
		// });

		// // Reinicio de los campos [ username, password ] 
		// $scope.datos = {
		// 	username: '',
		// 	password : '',
		// };
	};  

	$scope.viewIpServidor = function(form) {
		$state.go('ipServer');
	};

	//programar el boton fisico de android
	$ionicPlatform.registerBackButtonAction(function(e) {
  		alert("click");
  		ionic.Platform.exitApp();//para salir de la aplicacion
  		e.preventDefault();
	}, 101);
};

nameApp.controller( 'controlLogin', controlLogin );

