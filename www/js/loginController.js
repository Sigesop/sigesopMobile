sigesopMobile.controller( 'loginController', function ( $scope,
							 					  $sigesop,
												  $state,
												  $http,
												  $ionicHistory,
												  $ionicPlatform,
												  $localStorage,
							 					  $ionicLoading ) 
{
	$scope.datos = {
		username: '',
		password : '',
	};

	/* verificamos si existe un usuario logeado
	 * y nos saltamos la vista de login
	 */
	$scope.getDatos = function( form, datos ) {
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
				valor: datos.password.SHA1()
			}
		};

		$ionicLoading.show({
			template    : '<ion-spinner></ion-spinner>',
			// template    : '<ion-content><ion-spinner></ion-spinner> Cargando ...</ion-content>',
			animation   : 'fade-in',
			showBackdrop: true,
			// maxWidth    : 200,
			showDelay   : 0
		});

		// Lanzamiento de Ajax al servidor
		$sigesop.query({
			data: dataUser,
			type: 'POST',
			class: 'sistema',
			query: 'solicitudInicioSesion',
			queryType: 'sendGetData',
			success: function ( data ) {
				$ionicLoading.hide();

				if ( $sigesop.isEmptyObject( data ) ) {
					alert('Valor retornado del servidor es null');
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
						tx.executeSql( sql, [ dataUser.usuario.valor, dataUser.clave.valor ], function ( tx, res ){
		                    //guardamos usuario actual en navegador
		                    $sigesop.sesion = {
		                    	usuario: dataUser.usuario.valor,
		                    	password: dataUser.clave.valor
		                    }
		                    $ionicHistory.clearHistory();
        					$ionicHistory.clearCache();
							$state.go('main');
						});
					}, function ( e ){
						alert( 'Error guardando sesion. ' + e )
					})
				}

				// CUANDO EL USUARIO NO ES VALIDO
				else {
					$sigesop.alert({
						title: 'Usuario inválido'
					});
				}
			},
			error: function ( message, stack ) {
				$ionicLoading.hide();
				$sigesop.alert({
					title: stack
				})			
				// alert( 'Error solicitudInicioSesion: ' + stack );
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

	$scope.viewIpServidor = function( form ) {
		$state.go('ipServer');
	};

	// programar el boton fisico de android
	// $ionicPlatform.registerBackButtonAction(function(e) {
 //        $ionicHistory.clearHistory();
 //        $ionicHistory.clearCache();

 //  		ionic.Platform.exitApp();//para salir de la aplicacion
 //  		e.preventDefault();
	// }, 101);
});

