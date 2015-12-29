sigesopMobile.controller('equiposController', function ($scope, $sigesop, $checkList, $state, $ionicLoading, $q) {
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
		
		if ( toState.name == 'equiposView' ) {
			$scope.init();
		}
	});

	var readEquipos = function ( id_prog_mtto, id_sistema_aero, success ) {
		var sql = "SELECT DISTINCT id_equipo_aero, nombre_equipo_aero "+
			"FROM actividad_verificar "+
			"WHERE id_prog_mtto = ? "+
			"AND id_sistema_aero = ?";

		var _sql = "SELECT COUNT(id_actividad_verificar) AS elements "+
			"FROM actividad_verificar "+
			"WHERE id_prog_mtto = ? "+
			"AND id_equipo_aero = ?";

		var asyncCountActividades = function ( id_prog_mtto, id_equipo_aero ) {
			var deferred = $q.defer();

			db.transaction(function ( tx, res ) {
				tx.executeSql( _sql, [ id_prog_mtto, id_equipo_aero ], function ( tx, res ) {
					deferred.resolve( res.rows.item(0).elements );
				})
			}, function ( e ){
				deferred.reject( 'Error sql asyncCountActividades: ' + e );
			});

			return deferred.promise;
		}

		db.transaction(function ( tx, res ) {
			tx.executeSql( sql, [ id_prog_mtto, id_sistema_aero ], function ( tx, res ) {
				var i = 0, lon = res.rows.length;
				var equipos  = [];
				var promises = [];

				for( i ; i < lon; i++ ) {
					equipos.push( res.rows.item( i ) );					
					promises.push( asyncCountActividades( id_prog_mtto, res.rows.item( i ).id_equipo_aero ) );
				}

				var arr = [];
				$q.all( promises ).then(function ( arr_elements ){
					angular.forEach( equipos, function ( equipo, index ) {
						equipo.elements = arr_elements[ index ];
						arr.push( equipo )
					})
					success ( arr );
				})				
			}, function ( e ) {
				alert( 'Error sql readEquipos: ' + e );
			})
		}, function ( e ) {

		});
	}

	$scope.init = function () {
		$scope.items = []		
		readEquipos( $checkList.id_prog_mtto, $checkList.id_sistema_aero, function ( equipos ){
			$scope.items = equipos;
		})
	};

	$scope.clickEquipo = function ( id_prog_mtto, id_equipo_aero, nombre_equipo_aero ) {
		// alert( nombre_equipo_aero )
		$checkList.id_equipo_aero = id_equipo_aero;
    	$state.go( 'actividadesView' );
	}

    $scope.backButton = function () {
		$checkList.id_equipo_aero  = null;
        $state.go('sistemasView');
    };
})