sigesopMobile.controller('mainController', function ( $scope, $sigesop, $checkList, $q, $state, $ionicPopup, $timeout, $ionicSideMenuDelegate, $ionicHistory, $http, $ionicLoading, $ionicActionSheet ) {
	$scope.items = [];
	$scope.sesion = {
		usuario: '',
		password: ''
	};

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		/* Property [fromState]
		 * controller
		 * name
		 * templateUrl
		 * url
		 *
		 * Property [toState]
		 * controller
		 * name
		 * onEnter
		 * templateUrl
		 * url
		 */
		
		if ( toState.name == 'main' ) {
			$scope.init();
		}
	});

	$scope.onlineShow = function () {
		if ( $sigesop.keepAlive ) {
			return true;
		}
	};

	$scope.onlineHide = function () {
		if ( !$sigesop.keepAlive ) {
			return true;
		}
	};

	var insertaOrdenTrabajo = function ( data ) {
		angular.forEach( data, function ( orden_trabajo, i ){
			var sql = "INSERT INTO programacion_mtto( " +
				"id_orden_trabajo, " +
				"id_prog_mtto, " +
				"id_mantenimiento, "+
				"nombre_mantenimiento, "+
				"trabajo_solicitado, " +
				"responsable, "+
				"fecha_inicial, "+
				"fecha_final, "+
				"id_orden_reprog, "+
				"fecha_realizada, "+
				"estado_asignado " +
			") " +
			"VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";

			db.transaction(function ( tx ){
				tx.executeSql( sql, [
						orden_trabajo.id_orden_trabajo,
						orden_trabajo.id_prog_mtto,
						orden_trabajo.id_mantenimiento,
						orden_trabajo.nombre_mantenimiento,
					 	orden_trabajo.trabajo_solicitado,
					 	orden_trabajo.orden_trabajo_personal.responsable,
					 	orden_trabajo.fecha_inicial,
					 	orden_trabajo.fecha_final,
					 	orden_trabajo.id_orden_reprog,
					 	orden_trabajo.fecha_realizada,
					 	orden_trabajo.estado_asignado
					],
					function ( tx, res ){
						// desglosando sistemas del orden de trabajo
						angular.forEach( orden_trabajo.data, function ( _sistema, j ) {
							// desglosando equipos del orden de trabajo
							angular.forEach( _sistema.data, function ( _equipo, k ) {
								insertaActividad( tx, orden_trabajo.id_prog_mtto, _sistema, _equipo )
							});
						});
						// alert( 'Orden trabajo OK' );
					}
				)
			}, function ( e ){
				alert( 'Error. programacion_mtto: ' + e )
			})
		});
	};

	var insertaActividad = function ( tx, id_prog_mtto, sistema, equipo ) {
		// desglosando actividades del orden de trabajo
		angular.forEach( equipo.data, function ( actividad, i ) {
			var sql = "INSERT INTO actividad_verificar( "+
				"id_prog_mtto, " +
                "id_actividad_verificar, " +
                "id_lista_verificacion, " +
                "id_sistema_aero, " +
                "nombre_sistema_aero, "+
                "id_equipo_aero, " +
                "nombre_equipo_aero, "+
                "actividad_verificar " +
			") VALUES (?,?,?,?,?,?,?,?)";

			tx.executeSql(
				sql,
				[
					id_prog_mtto,
					actividad.id_actividad_verificar,
					actividad.id_lista_verificacion,
					actividad.id_sistema_aero,
					sistema.nombre_sistema_aero,
					actividad.id_equipo_aero,
					equipo.nombre_equipo_aero,
					actividad.actividad_verificar
				],
				function ( tx, res ) {
					// desglosando parametros
					angular.forEach( actividad.parametro_actividad, function ( parametro_actividad, j ){
						insertaParametro ( tx, id_prog_mtto, parametro_actividad );
					});

					// desglosando lectura actual
					angular.forEach( actividad.lectura_actual, function ( lectura_actual, j ){
						insertaLecturaActual ( tx, id_prog_mtto, lectura_actual );
					});

					// desglosando lectura posterior
					angular.forEach( actividad.lectura_posterior, function ( lectura_posterior, j ){
						insertaLecturaPosterior ( tx, id_prog_mtto, lectura_posterior );
					});
				},
				function ( e ) {
					alert( 'Error actividad_verificar: ' + e );
				}
			);
		})
	};

	var insertaParametro = function ( tx, id_prog_mtto, parametro_actividad ) {
		var sql = "INSERT INTO parametro_actividad ("+
	        "id_prog_mtto, " +
	        "id, " +
	        "id_actividad, " +
	        "tipo_dato, " +
	        "dato, " +
	        "parametro, " +
	        "unidad_medida, " +
	        "secuencia_datos " +
		") VALUES (?,?,?,?,?,?,?,?)";

		tx.executeSql(
			sql,
			[
		        id_prog_mtto,
		        parametro_actividad.id,
		        parametro_actividad.id_actividad,
		        parametro_actividad.tipo_dato,
		        parametro_actividad.dato,
		        parametro_actividad.parametro,
		        parametro_actividad.unidad_medida,
		        parametro_actividad.secuencia_datos
			],
			function ( tx, res ) {
				// alert( 'insertaParametro OK' );
			},
			function ( e ) {
				alert( 'Error insertaParametro: ' + e );
			}
		);
	};

	var insertaLecturaActual = function ( tx, id_prog_mtto, lectura_actual ) {
		var sql = "INSERT INTO lectura_actual ("+
	        "id_prog_mtto, " +
	        "id, " +
	        "id_actividad, " +
	        "tipo_dato, " +
	        "parametro, " +
	        "unidad_medida, " +
	        "secuencia_datos " +
		") VALUES (?,?,?,?,?,?,?)";

		tx.executeSql(
			sql,
			[
		        id_prog_mtto,
		        lectura_actual.id,
		        lectura_actual.id_actividad,
		        lectura_actual.tipo_dato,
		        lectura_actual.parametro,
		        lectura_actual.unidad_medida,
		        lectura_actual.secuencia_datos
			],
			function ( tx, res ) {
				// alert( 'insertaParametro OK' );
			},
			function ( e ) {
				alert( 'Error insertaLecturaActual: ' + e );
			}
		);
	};

	var insertaLecturaPosterior = function ( tx, id_prog_mtto, lectura_posterior ) {
		var sql = "INSERT INTO lectura_posterior ("+
	        "id_prog_mtto, " +
	        "id, " +
	        "id_actividad, " +
	        "tipo_dato, " +
	        "parametro, " +
	        "unidad_medida, " +
	        "secuencia_datos " +
		") VALUES (?,?,?,?,?,?,?)";

		tx.executeSql(
			sql,
			[
		        id_prog_mtto,
		        lectura_posterior.id,
		        lectura_posterior.id_actividad,
		        lectura_posterior.tipo_dato,
		        lectura_posterior.parametro,
		        lectura_posterior.unidad_medida,
		        lectura_posterior.secuencia_datos
			],
			function ( tx, res ) {
				// alert( 'insertaParametro OK' );
			},
			function ( e ) {
				alert( 'Error insertaLecturaPosterior: ' + e );
			}
		);
	};

	// obtiene todos los datos de la orden de trabajo
	var readOrdenesTrabajo = function ( success ) {
		var data = [];

		db.transaction(function ( tx, res ){
			var sql = "SELECT " +
	            "id_orden_trabajo, " +
	            "id_prog_mtto, " +
	            "id_mantenimiento, " +
	            "nombre_mantenimiento, " +
	            "trabajo_solicitado, " +
	            "responsable, " +
	            "fecha_inicial, " +
	            "fecha_final, " +
	            "id_orden_reprog, " +
	            "fecha_realizada, " +
	            "estado_asignado " +
	        "FROM programacion_mtto "+
	        "WHERE responsable = ? ";
			tx.executeSql(
				sql, [ $sigesop.sesion.usuario ],
				function ( tx, res ) {
					var i = 0, lon = res.rows.length;
					for( i; i < lon; i++ ) {
						var orden_trabajo = res.rows.item( i );
						data.push( orden_trabajo );
					}

					success( data );
				}
			);
		}, function ( e ){
			alert( 'Error getOrdenesTrabajoDB: ' + e );
		});
	}

	$scope.init = function () {
		$scope.sesion = $sigesop.sesion;
		$scope.servidor = $sigesop.ipServidor;

		// consulta ordenes de trabajo almacenadas de manera local
		// para decidir que hacer con los datos
		var sql = "SELECT id_prog_mtto FROM programacion_mtto WHERE responsable = ?";
		db.transaction(function( tx, res ){
			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function( tx, res ) {
				// estructurar datos locales
				if ( res.rows.length > 0 ) {
					$ionicLoading.show({
						template    : '<ion-spinner></ion-spinner>',
						animation   : 'fade-in',
						showBackdrop: true,
						showDelay   : 0
					});
					readOrdenesTrabajo(function ( data ) {
						$scope.imagen = $sigesop.icono;
						$scope.items = data;
						$ionicLoading.hide();
					});					
				}

				// descargar datos del servidor
				else {
					if ( $sigesop.sesion.usuario && $sigesop.networkState && $sigesop.keepAlive ) {
						$ionicLoading.show({
							template    : '<ion-spinner></ion-spinner>',
							animation   : 'fade-in',
							showBackdrop: true,
							showDelay   : 0
						});

						$sigesop.query({
							data: { usuario: $sigesop.sesion.usuario },
							class: 'mantenimiento',
							query: 'obtenerOrdenTrabajoLista',
							queryType: 'sendGetData',
							success: function ( data ) {
								$scope.imagen = $sigesop.icono;
							  	$scope.items = data;
							  	$ionicLoading.hide();
							  	insertaOrdenTrabajo( data );
							},
							error: function ( data ) {
								$ionicLoading.hide();
								alert( 'Error ajax: obtenerOrdenTrabajo. ' + data );
							}
						});
					}

					else {

					}
				}
			});
		},
		function ( e ) {
			alert( 'Error consulta ordenes' + e );
		});
	};

	$scope.toggleLeft = function () {
		$ionicSideMenuDelegate.toggleLeft();
	};

	$scope.ordenesCapturadas = function () {

	};

	var confirmarCierre = function() {
		var asyncDeleteTableLecturaPosterior = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM lectura_posterior "+
			"WHERE id_prog_mtto IN( "+
				"SELECT id_prog_mtto FROM programacion_mtto "+
				"WHERE responsable = ?"+
			")";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableLecturaPosterior' + e );
			})

			return deferred.promise;
		};

		var asyncDeleteTableLecturaActual = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM lectura_actual "+
			"WHERE id_prog_mtto IN( "+
				"SELECT id_prog_mtto FROM programacion_mtto "+
				"WHERE responsable = ?"+
			")";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableLecturaActual' + e );
			})

			return deferred.promise;
		};

		var asyncDeleteTableParametroActividad = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM parametro_actividad "+
			"WHERE id_prog_mtto IN( "+
				"SELECT id_prog_mtto FROM programacion_mtto "+
				"WHERE responsable = ?"+
			")";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableParametroActividad' + e );
			})

			return deferred.promise;
		};

		var asyncDeleteTableActividadVerificar = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM actividad_verificar "+
			"WHERE id_prog_mtto IN( "+
				"SELECT id_prog_mtto FROM programacion_mtto "+
				"WHERE responsable = ?"+
			")";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableActividadVerificar' + e );
			})

			return deferred.promise;
		};

		var asyncDeleteTableProgramacionMtto = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM programacion_mtto WHERE responsable = ?";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableProgramacionMtto' + e );
			})

			return deferred.promise;
		};

		var asyncDeleteTableSesion = function ( tx ) {
			var deferred = $q.defer();
			var sql = "DELETE FROM sesion WHERE state = 1 AND user = ?";

			tx.executeSql( sql, [ $sigesop.sesion.usuario ], function ( tx, res ) {
				deferred.resolve( 'OK' );
			}, function ( e ){
				deferred.reject( 'Error SQL asyncDeleteTableSesion' + e );
			})

			return deferred.promise;
		};

		
		// "UPDATE sesion SET state = 0 WHERE state = 1";
		db.transaction(function ( tx, res ){
			var promises = [
				asyncDeleteTableLecturaPosterior( tx ),
				asyncDeleteTableLecturaActual( tx ),
				asyncDeleteTableParametroActividad( tx ),
				asyncDeleteTableActividadVerificar( tx ),
				asyncDeleteTableProgramacionMtto( tx ),
				asyncDeleteTableSesion( tx )
			];

			$q.all( promises ).then(function( data ){
				$sigesop.sesion = {
		            usuario: null,
		            password: null
		        };
		        
				$ionicHistory.clearHistory();
	    		$ionicHistory.clearCache();
				$state.go('login');
			}, function ( e ) {
				console.log( e );
			})
		}, function ( e ){
			alert( 'Error sql cerrar sesion. ' + e );
			return true;
		});
	};

	$scope.cerrarSesion = function( form ) {
		$ionicPopup.confirm({
			title     : 'Cerrar sesión',
			template  : '¿Está usted seguro de cerrar sesión?',
			cancelText: 'Cancelar',
			okText    : 'Aceptar'
		})
		.then(function(res) {
			if(res) confirmarCierre();
		});
  	};

  	$scope.cambiarUsuario = function( form ) {
		$sigesop.alert({
			title   : 'ADVERTENCIA!!!',
			subtitle: 'Lo sentimos<br>Por el momento no esta disponible...</br>',
			time    : '3000'
	    });
  	};

  	var capturarListaVerificacion = function ( id_prog_mtto, success ) {
		$checkList.id_prog_mtto = id_prog_mtto;		
		$state.go('sistemasView');
  	};

  	var subirDatos = function ( id_prog_mtto, success ) {
		alert( 'SUBIR DATOS: ' + id_prog_mtto );
		success();
  	};

  	$scope.onHold = function ( id_prog_mtto ) {
		var hideSheet = $ionicActionSheet.show({
			// titleText: 'Opciones...',
			buttons: [
				{ text: '<i class="icon ion-ios-list-outline"></i> Capturar lista de verificación' },
				{ text: '<i class="icon ion-upload"></i> Subir datos' },
			],
			// destructiveText: 'Delete',
			// cancelText: 'Cancel',
			// cancel: function() {
			// 	console.log('CANCELLED');
			// },
			buttonClicked: function( index ) {
				switch ( index ) {
					case 0:
						capturarListaVerificacion( id_prog_mtto, function () {
							hideSheet();
						});
						break;
					case 1:
						subirDatos( id_prog_mtto, function () {
							hideSheet();
						});
					break;
				}
			},
			destructiveButtonClicked: function() {
				// alert('DESTRUCT');
				return true;
			}
		});

		// var options = {
		// 	title: 'What do you want with this image?',
		// 	buttonLabels: [
		// 		'Capturar lista de verificación',
		// 		'Subir datos'
		// 	],
		// 	addCancelButtonWithLabel: 'Cancel',
		// 	androidEnableCancelButton : true,
		// 	winphoneEnableCancelButton : true,
		// 	addDestructiveButtonWithLabel : 'Delete it'
		// };

		// $cordovaActionSheet.show(options)
		// .then(function(btnIndex) {
		// 	var index = btnIndex;
		// 	alert( btnIndex );
		// });
  	}
});