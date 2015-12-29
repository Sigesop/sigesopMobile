sigesopMobile.controller('sistemasController', function ( $scope, $sigesop, $checkList, $state, $ionicLoading, $q ) {
	var readSistemas = function ( id_prog_mtto, success ) {
		var sql = "SELECT DISTINCT id_sistema_aero, nombre_sistema_aero "+
			"FROM actividad_verificar "+
			"WHERE id_prog_mtto = ?";

		var _sql = "SELECT COUNT(DISTINCT id_equipo_aero) AS elements "+
			"FROM actividad_verificar "+
			"WHERE id_prog_mtto = ? "+
			"AND id_sistema_aero = ?";

		var asyncCountEquipos = function ( id_prog_mtto, id_sistema_aero ) {
			var deferred = $q.defer();

			db.transaction(function ( tx, res ) {
				tx.executeSql( _sql, [ id_prog_mtto, id_sistema_aero ], function ( tx, res ) {
					deferred.resolve( res.rows.item(0).elements )
				})
			}, function ( e ) {
				alert( 'Error sql asyncCountEquipos: ' + e )
			});

			return deferred.promise;
		}

		db.transaction(function ( tx, res ) {
			tx.executeSql( sql, [ id_prog_mtto ], function ( tx, res ){
				var i = 0, lon = res.rows.length;
				var sistemas = [];
				var promises = [];

				for( i ; i < lon; i++ ) {
					sistemas.push( res.rows.item( i ) );
					promises.push( asyncCountEquipos( id_prog_mtto, res.rows.item( i ).id_sistema_aero ) )
				}

				var arr = [];
				$q.all( promises ).then(function ( arr_elements ) {
					angular.forEach( sistemas, function ( sistema, index ){
						sistema.elements = arr_elements[ index ];
						arr.push( sistema );
					})
					success( arr );
				})
			}, function ( e ) {
				alert( 'Error sql readSistemas: ' + e )
			});
		}, function ( e ) {
			alert( 'Error sql readSistemas: ' + e )
		});
	}

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

		if ( toState.name == 'sistemasView' ) {
			$scope.init();
		}
	});

	$scope.init = function () {
		$scope.items = []; // vaciar vista, pues quedan los elementos en cache
		readSistemas( $checkList.id_prog_mtto, function ( sistemas ) {
			$scope.items = sistemas;
		})
	}

    $scope.backButton = function () {
		$checkList.id_prog_mtto    = null;
		$checkList.id_sistema_aero = null;
        $state.go('main');
    };

    $scope.clickSistema = function ( id_prog_mtto, id_sistema_aero, nombre_sistema_aero ) {
		$checkList.id_sistema_aero = id_sistema_aero;
    	$state.go( 'equiposView' );
    }
})