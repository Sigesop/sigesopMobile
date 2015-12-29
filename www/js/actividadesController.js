sigesopMobile.controller('actividadesController', function ($scope, $sigesop, $checkList, $state, $q, $ionicLoading, $ionicPopover, $cordovaCamera, $cordovaFile) {
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

		if ( toState.name == 'actividadesView' ) {
			$scope.init();
		}
	});	

	$ionicPopover.fromTemplateUrl('view/templates/optionsActividad.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.options = popover;
	});

	var initTrack = $checkList.initTrack();
	initTrack.go(5000);

   	var readActividades = function ( id_prog_mtto, id_equipo_aero, success ) {
		var asyncReadParametro = function ( id_actividad_verificar, id_prog_mtto ) {
			var deferred = $q.defer();

			readParametro ( id_actividad_verificar, id_prog_mtto, function( parametros ){
				deferred.resolve( parametros );
			});

			return deferred.promise;
		};

	 	var asyncReadLectura = function ( id_actividad_verificar, id_prog_mtto, tabla_lectura ) {
			var deferred = $q.defer();

			readLectura ( id_actividad_verificar, id_prog_mtto, tabla_lectura, function( lecturas ){
				deferred.resolve( lecturas );
			});

			return deferred.promise;
	 	};

		var asyncReadImagen = function ( id_actividad_verificar, id_prog_mtto ) {
			var deferred = $q.defer();

			readImagen( id_actividad_verificar, id_prog_mtto, function ( media_url ){
				deferred.resolve( media_url );
			})

			return deferred.promise;
		};

		var asyncReadActividad = function ( actividad_verificar, id_prog_mtto ) {
			var deferred = $q.defer();

			$q.all({
				parametro_actividad: asyncReadParametro( actividad_verificar.id_actividad_verificar, id_prog_mtto ),
				lectura_actual     : asyncReadLectura( actividad_verificar.id_actividad_verificar, id_prog_mtto, 'lectura_actual' ),
				lectura_posterior  : asyncReadLectura( actividad_verificar.id_actividad_verificar, id_prog_mtto, 'lectura_posterior' ),
				imagenes           : asyncReadImagen( actividad_verificar.id_actividad_verificar, id_prog_mtto )
			})
			.then(function ( datos_actividad ) {
				actividad_verificar.parametro_actividad = datos_actividad.parametro_actividad;
				actividad_verificar.lectura_actual      = datos_actividad.lectura_actual;
				actividad_verificar.lectura_posterior   = datos_actividad.lectura_posterior;
				actividad_verificar.imagenes            = datos_actividad.imagenes;
				deferred.resolve( actividad_verificar );
			})

			return deferred.promise;
		};

		var sql = "SELECT " +
            "id_prog_mtto, " +
            "id_actividad_verificar, " +
            "id_lista_verificacion, " +
            "id_sistema_aero, " +
            "nombre_sistema_aero, "+
            "id_equipo_aero, " +
            "nombre_equipo_aero,  "+
            "actividad_verificar, " +
            "observaciones "+
        "FROM actividad_verificar "+
        "WHERE id_prog_mtto = ? "+
        "AND id_equipo_aero = ?";

        db.transaction(function ( tx, res ) {
        	tx.executeSql( sql, [ id_prog_mtto, id_equipo_aero ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var promises = [];

				for( i ; i < lon; i++ ) {
					promises.push( asyncReadActividad ( res.rows.item( i ), id_prog_mtto ) )
				}

				$q.all( promises ).then( success );
        	});
        }, function ( e ) {
			alert( 'Error sql readActividades: ' + e );
        });
	}

	var readParametro = function ( id_actividad_verificar, id_prog_mtto, success ) {
		var sql = "SELECT "+
            "id_prog_mtto, " +
            "id, " +
            "id_actividad, " +
            "tipo_dato, " +
            "dato, " +
            "parametro, " +
            "unidad_medida, " +
            "secuencia_datos "+
		"FROM parametro_actividad "+
		"WHERE id_prog_mtto = ? "+
		"AND id_actividad = ?";

		db.transaction(function ( tx, res ){
			tx.executeSql( sql, [ id_prog_mtto, id_actividad_verificar ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var parametros = [];

				for( i ; i < lon; i++ ) {
					var row = res.rows.item( i );
					switch ( row.tipo_dato ) {
						case 'TOLERANCIA':
							var dato_tol = row.dato.splitParametros( ',' );
							row.tolerancia = dato_tol[ 1 ];
							row.dato = dato_tol[ 0 ];
						break;

						case 'RANGO':
							var inf_sup = row.dato.splitParametros( ',' );
							row.dato_inferior = inf_sup[ 0 ];
							row.dato_superior = inf_sup[ 1 ];
						break;
					}

					parametros.push( row );
				}

				success ( parametros );
			})
		}, function ( e ) {
			alert( 'Error sql readParametro: ' + e )
		});
	}

	var readLectura = function ( id_actividad_verificar, id_prog_mtto, tabla_lectura, success ) {
		var sql = "SELECT "+
            "id_prog_mtto, " +
            "id, " +
            "id_actividad, " +
            "tipo_dato, " +
            "dato_capturado, "+
            "parametro, " +
            "unidad_medida, " +
            "secuencia_datos " +
		"FROM " + tabla_lectura +
		" WHERE id_prog_mtto = ? "+
		"AND id_actividad = ?";

		db.transaction(function ( tx, res ){
			tx.executeSql( sql, [ id_prog_mtto, id_actividad_verificar ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var lecturas = [];

				for( i ; i < lon; i++ ) lecturas.push( res.rows.item( i ) );
				success ( lecturas );
			})
		}, function ( e ) {
			alert( 'Error sql readLectura: ' + e )
		});
	}

	// codificando imagen a base64
	var _readImagen = function ( id_actividad_verificar, id_prog_mtto, success ) {
		var sql = "SELECT media_url FROM imagen_actividad_verificar " +
			"WHERE id_actividad_verificar = ? " +
			"AND id_prog_mtto = ?";

		var asyncUrltoImage = function ( urlImage ) {
			var deferred = $q.defer();
	    	var pathFile = $sigesop.getPathFile( urlImage );
	    	var nameFile = $sigesop.getNameFile( urlImage );

	    	console.log( 'pathFile: ' + pathFile );
	    	console.log( 'nameFile: ' + nameFile );

	    	$cordovaFile.readAsDataURL( pathFile, nameFile )
	    	.then(function ( res ) {
	    		deferred.resolve ( res );
	    	}, function ( err ) {
	    		deferred.reject( err );
	    	})

	    	return deferred.promise;
		};

		db.transaction(function ( tx, res ){
			tx.executeSql( sql, [ id_actividad_verificar, id_prog_mtto ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var media_url = [];
				var promises  = [];

				for ( i; i < lon; i++ ) {
					promises.push( asyncUrltoImage( res.rows.item( i ).media_url ) );
				}

				$q.all( promises ).then( success, function ( err ) {
					console.log( "##### ERROR [asyncUrltoImage] ###########################################" );
					console.log( 'Property err: ' + $sigesop.getOwnPropertyNames( err ) );
		            console.log( 'err code: ' + err.code );
		            console.log( 'err message: ' + err.message );
		            console.log( "#########################################################################" );
		            alert( 'Error guardando asyncUrltoImage. ' + err.message );
				})
			})
		}, function ( err ) {
			console.log( "##### ERROR [readImagen] ###########################################" );
            console.log( 'err code: ' + err.code );
            console.log( 'err message: ' + err.message );
            console.log( 'err stack: ' + err.stack );
            console.log( "####################################################################" );
            alert( 'Error guardando URL_MEDIA. ' + err );
		});
	};

	var readImagen = function ( id_actividad_verificar, id_prog_mtto, success ) {
		var sql = "SELECT media_url FROM imagen_actividad_verificar " +
			"WHERE id_actividad_verificar = ? " +
			"AND id_prog_mtto = ?";

		db.transaction(function ( tx, res ){
			tx.executeSql( sql, [ id_actividad_verificar, id_prog_mtto ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var media_url = [];

				for ( i; i < lon; i++ ) {
					media_url.push( res.rows.item( i ).media_url );
				}

				success( media_url );
			})
		}, function ( err ) {
			console.log( "##### ERROR [readImagen] ###########################################" );
            console.log( 'err code: ' + err.code );
            console.log( 'err message: ' + err.message );
            console.log( 'err stack: ' + err.stack );
            console.log( "####################################################################" );
            alert( 'Error guardando URL_MEDIA. ' + err );
		});
	}

	$scope.init = function () {
		$ionicLoading.show({
			template    : '<ion-spinner></ion-spinner>',
			animation   : 'fade-in',
			showBackdrop: true,
			showDelay   : 0
		});
		$scope.items = [];
		readActividades ( $checkList.id_prog_mtto, $checkList.id_equipo_aero, function ( actividades ) {
			$scope.items = actividades;
			$ionicLoading.hide();
		})
	}

    $scope.backButton = function () {
		// $checkList.id_sistema_aero = null;
        initTrack.abort();
        $state.go('equiposView');
    };

    // funcion para ingresar el campo [observaciones] de la actividad
    // a la base de datos local
    var insertObservaciones = function ( tx, id_actividad_verificar, observaciones, success ) {
    	if ( $sigesop.isEmptyObject( observaciones ) ) {
    		success ( 'Empty' ); // retornamos cadena [Empty] para indicar elemento vacio
    		return;
    	}

		var sql = "UPDATE actividad_verificar "+
		"SET observaciones = ? "+
		"WHERE id_prog_mtto = ? "+
		"AND id_actividad_verificar = ?";

		// console.log( 'sql: ' + sql );
		// console.log( 'observaciones: ' + observaciones );
		// console.log( 'id_actividad_verificar: ' + id_actividad_verificar );

		tx.executeSql( sql,
			[
				observaciones.toUpperCase(),
				$checkList.id_prog_mtto,
				id_actividad_verificar
			],
			function ( tx, res ) {
				success ( 'OK' );
			}, function ( e ){
				alert( 'Error SQL insertObservaciones: ' + e )
				return true;
			}
		)
    }

    // funcion para ingresar el campo [dato_capturado] de la lectura
    // actual y posterior a la base de datos local
    var insertDatoLectura = function ( tx, id, dato_capturado, tabla_lectura, success ) {
    	if ( $sigesop.isEmptyObject( dato_capturado ) ) {
    		success ( 'Empty' ); // retornamos cadena [Empty] para indicar elemento vacio
    		return;
    	}

		var sql = "UPDATE " + tabla_lectura + " SET dato_capturado = ? "+
		"WHERE id_prog_mtto = ? "+
		"AND id = ?";

		// console.log( 'sql: ' + sql );
		// console.log( 'dato_capturado: ' + dato_capturado );
		// console.log( 'id: ' + id );

		tx.executeSql(
			sql,
			[
				dato_capturado,
				$checkList.id_prog_mtto,
				id
			],
			function ( tx, res ) {
				success ( res.insertId )
			}, function ( e ){
				alert( 'Error SQL insertDatoLectura ' + tabla_lectura + ': ' + e )
				return true;
			}
		)
    }

    $scope.guardarCambios = function () {
		$ionicLoading.show({
			template    : '<ion-spinner></ion-spinner>',
			animation   : 'fade-in',
			showBackdrop: true,
			showDelay   : 0
		});

		var asyncInsertObservaciones = function ( tx, id_actividad_verificar, observaciones ) {
			var deferred = $q.defer();

			insertObservaciones( tx, id_actividad_verificar, observaciones, function ( state ) {
				if ( state != 'Empty' ) {
					deferred.resolve( state );
				} else {
					deferred.reject( state )
				}
			})

			return deferred.promise;
		}

		var asyncInsertDatoLectura = function ( tx, id, dato_capturado, tabla_lectura ) {
			var deferred = $q.defer();

			insertDatoLectura( tx, id, dato_capturado, tabla_lectura, function ( state ) {
				if ( state != 'Empty' ) {
					deferred.resolve( state );
				} else {
					deferred.reject( state )
				}
			})

			return deferred.promise;
		}

		var asyncInsertActividadVerificar = function ( tx, actividad_verificar ) {
			var deferred = $q.defer();
			var promises = [
				asyncInsertObservaciones(
					tx,
					actividad_verificar.id_actividad_verificar,
					actividad_verificar.observaciones
				)
			];

    		// accedemos a la lectura actual
    		angular.forEach( actividad_verificar.lectura_actual, function ( lectura_actual, i ){
    			promises.push(
    				asyncInsertDatoLectura(
    					tx,
    					lectura_actual.id,
    					lectura_actual.dato_capturado,
    					'lectura_actual'
    				)
    			)
    		});

    		// accedemos a la lectura posterior
    		angular.forEach( actividad_verificar.lectura_posterior, function ( lectura_posterior, j ){
    			promises.push(
    				asyncInsertDatoLectura(
    					tx,
    					lectura_posterior.id,
    					lectura_posterior.dato_capturado,
    					'lectura_posterior'
    				)
    			)
    		});

			// lanzamos la consulta asincrona
			$q.all( promises ).then( function ( data ) {
				deferred.resolve( data );
			}, function ( e ) {
				deferred.reject( e );
			})

			return deferred.promise;
		}

		var promises = [];

    	// accedemos hasta la propiedad donde se almacenan todas las actividades
    	// de la variable [items] donde se almacena
		angular.forEach( $scope.items, function ( actividad_verificar, i ){
			db.transaction(function ( tx, res ){
				promises.push(
					asyncInsertActividadVerificar( tx, actividad_verificar )
				);
			}, function ( e ) {
		    	$scope.options.hide();
		    	$ionicLoading.hide();
				alert( 'Error SQL guardarCambios: ' + e )
			});
		});

		$q.all( promises ).then(function ( data ) {
			$scope.options.hide();
			$ionicLoading.hide();
			$sigesop.alert({
				title: 'Datos guardados...'
			});
		}, function ( e ) {
			$scope.options.hide();
			$ionicLoading.hide();
			$sigesop.alert({
				title: 'Datos sin guardarse...'
			});
		});

    	// console.log( $sigesop.getOwnPropertyNames( $scope.options ) );
    }

    $scope.takePhoto = function ( id_actividad_verificar ) {
		$cordovaCamera.getPicture({
			quality: 30,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			cameraDirection: 1,
			saveToPhotoAlbum: false
		})
		.then(function ( imageUrl ) {
			// var image = document.getElementById('myImage');
			// image.src = "data:image/jpeg;base64," + imageUrl;

			console.log( 'imageUrl: ' + imageUrl )

			//Grab the file name of the photo in the temporary directory
			// var currentName = imageUrl.replace(/^.*[\\\/]/, '');

			//Create a new name for the photo
			var d = new Date(),
				n = d.getTime();

			var newName = 	$checkList.id_prog_mtto + '-' + $checkList.id_sistema_aero + '-' +
							$checkList.id_equipo_aero + '-' + id_actividad_verificar + '-' +
							n + '.jpg';

			var name           = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
			var namePath       = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
			var ROOT_DIRECTORY = cordova.file.externalRootDirectory;
			var EQUIP_DIR      = $checkList.EQUIP_DIR();
			var IMG_DIR        = $checkList.IMG_DIR( id_actividad_verificar );
			var IMG_PATH       = $checkList.IMG_PATH( id_actividad_verificar );

			// crea la carpeta [sigesop] en almacenamiento externo
			$cordovaFile.createDir( ROOT_DIRECTORY, $checkList.ROOT_DIR, true )
			.then(function (success) {
				console.log( 'success ROOT_DIR: ' + $checkList.ROOT_DIR );

				/* crea la subcarpeta en [sigesop] nombrada en base al
				 * [id_prog_mtto, id_sistema_aero, id_equipo_aero]
				 */
				$cordovaFile.createDir( ROOT_DIRECTORY, EQUIP_DIR, true )
				.then(function (success) {
					console.log( 'success EQUIP_DIR: ' + EQUIP_DIR );

					/* crea la subcarpeta en [id_prog_mtto, id_sistema_aero, id_equipo_aero]
					 * nombrada en base a la [id_actividad_verificar]
					 */ 
					$cordovaFile.createDir( ROOT_DIRECTORY, IMG_DIR, true )
					.then(function (success) {
						console.log( 'success IMG_DIR: ' + IMG_DIR );

						// ahora ya existe la carpeta de imagenes de la orden, movemos la imagen
						moveImg( namePath, name, IMG_PATH, newName, id_actividad_verificar )
					}, function ( err ) {
						console.log( 'ERROR IMG_DIR: ' + err.message );

						// if ( err.message == 'PATH_EXISTS_ERR' ) {
						// 	console.log( "PATH_EXISTS_ERR: " );
						// 	moveImg( namePath, name, sigesopImagePath, newName );
						// };
					});
				}, function ( err ) {
					console.log( 'ERROR EQUIP_DIR: ' + err.message );

					// if ( err.message == 'PATH_EXISTS_ERR' ) {
					// 	console.log( "PATH_EXISTS_ERR: " );
					// 	moveImg( namePath, name, sigesopImagePath, newName );
					// };
				});
			}, function ( err ) {
				console.log( 'ERROR ROOT_DIR: ' + err.message );

				// if ( err.message == 'PATH_EXISTS_ERR' ) {
				// 	console.log( "PATH_EXISTS_ERR: " );
				// 	moveImg( namePath, name, sigesopImagePath, newName );
				// };
			});
	    });
	}

	var moveImg = function ( namePath, name, dir, newName, id_actividad_verificar ) {
		console.log( '' );
		console.log( 'namePath: ' + namePath );
		console.log( 'name: ' + name );
		console.log( 'dir: ' + dir );
		console.log( 'newName: ' + newName );

		//Move the file to permanent storage
	    $cordovaFile.moveFile( namePath, name, dir, newName ).then(function( success ){
	    	/* Almacenamos todos los datos de la imagen
	    	 * para su uso en las vistas
	    	 */
	    	db.transaction(function ( tx, res ){
	    		var sql = "INSERT INTO imagen_actividad_verificar (" +
                    "id_actividad_verificar, " +
                    "id_prog_mtto, " +
                    "id_sistema_aero, " +
                    "id_equipo_aero, "+
                    "media_url, " +
                    "altitud, " +
                    "longitud " +
                ") VALUES ( ?,?,?,?,?,?,? )";

	    		tx.executeSql( sql,
	    			[
	    				id_actividad_verificar,
	    				$checkList.id_prog_mtto,
	    				$checkList.id_sistema_aero,
	    				$checkList.id_equipo_aero,
	    				dir + newName,
	    				$checkList.coords.altitud,
	    				$checkList.coords.longitud
	    			],

	    			function ( tx, res ) {
						// recargar datos en vista
						readActividades ( $checkList.id_prog_mtto, $checkList.id_equipo_aero, function ( actividades ) {
							$scope.items = actividades;
							$ionicLoading.hide();
						})
	    			}
	    		);
	    	}, function ( err ) {
	            console.log( 'err code: ' + err.code );
	            console.log( 'err message: ' + err.message );
	            console.log( 'err stack: ' + err.stack );
	            alert( 'Error guardando URL_MEDIA. ' + err );
	    	})

			//success.nativeURL will contain the path to the photo in permanent storage, do whatever you wish with it, e.g:
			//createPhoto(success.nativeURL);
			$sigesop.alert({
				title: 'Imagen guardada'
			});
			console.log( 'success.nativeURL: ' + success.nativeURL )
			console.log( $sigesop.getOwnPropertyNames( success ) );
		}, function( err ) {
			// console.log( $sigesop.getOwnPropertyNames( err ) );
			console.log( "moveFile err message: " + err.message );
			console.log( "moveFile err stack: " + err.stack );
			console.log( "moveFile err code: " + err.code );
		});
	}
});