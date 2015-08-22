var 

controlLogin = function ( $scope, $state, $http, $cordovaSQLite, $ionicHistory, $ionicPlatform) {
	$scope.datos = {
		username: '',
		password : '',
	};

	/* verificamos si existe un usuario logeado
	 * y nos saltamos la vista de login	
	 */

	$scope.getDatos = function(form, datos) {
		if( !form.$valid ) {
			return -1;
		}

		/* Estructura de datos valido para iniciar
		 * sesion dentro del sistema
		 */
		var dataUser = {
			usuario: {
				valor: datos.username					
			},

			clave: {
				valor: sigesop.SHA1( datos.password )
			}
		};

		// Lanzamiento de Ajax al servidor
		sigesop.query( $http, {
			data: dataUser,
			type: 'POST',
			class: 'sistema',
			query: 'solicitudInicioSesion',
			queryType: 'sendGetData',
			success: function ( data ) {
				if ( sigesop.isEmptyObject( data ) ) {
					alert('Valor retornado del servidor es null');
					
					// $.unblockUI(); ---> LE FALTA BLOQUEAR PANTALLA CON IONIC
					return -1;		
				} 
		
				// CUANDO EL USUARIO NO ES VALIDO
				if ( data.estado ) {
					// FALTA TOAST CON IONIC
					// sigesop.msg( '<br><center>Acceso Autorizado</center>', '', 'success' );
										
					/* ENVIO A LA SIGUIENTE VISTA						
					 */ 
					var sql =
					"INSERT INTO sesion( user, password, state ) VALUES( ?, ?, 1 )";
					db.transaction(function ( tx ){
						tx.executeSql( sql, [ dataUser.usuario.valor, dataUser.clave.valor ] );
						$state.go('main');	
					}, function ( e ){
						alert( 'Error guardando sesion. ' + e )
					})
					
				} 

				// CUANDO EL USUARIO NO ES VALIDO
				else {
					alert( 'Usuario inválido' );
				}
			},
			error: function ( data ) {
				alert( 'Error ajax: ' + data );
			}
		});

		//eliminar el historial de navegacion de la aplicacion
		//$ionicHistory.clearHistory();
  		//$ionicHistory.clearCache();
      	
		// Reinicio de los campos [ username, password ] 
		// $scope.datos = {
		// 	username: '',
		// 	password : '',
		// };
	};  

	$scope.viewIpServidor = function(form) {
		$state.go('ipServer');
	};

	//programar el boton fisico de android
	// $ionicPlatform.registerBackButtonAction(function(e) {
 //  		alert("click");
 //  		ionic.Platform.exitApp();//para salir de la aplicacion
 //  		e.preventDefault();
	// }, 101);
};

nameApp.controller( 'controlLogin', controlLogin );

