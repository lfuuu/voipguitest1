var RouteTableEditCtrl = function ($scope, $q, RouteTable, List, Outcome, params, $modalInstance, $window, Redirect) {

    $scope.isFormReady = false;

    if (params.id) {
        $q.all([
            RouteTable.get({id: params.id}),
            List.number(1),
            List.number(2),
            List.number(3),
            List.cpc(),
            List.headerRule(),
            List.outcome(),
            List.routeTable(),
            List.trunkGroup()
        ]).then(function (results) {
            $scope.item = results[0];
            $scope.initialServerId = $scope.item.server_id;
            $scope.isFormReady = true;
        });
    } else {
        $scope.item = {
            server_id: $scope.server.id,
            routes: [],
            routeRules: [],
            route_mode: 'static'
        };
        $scope.isFormReady = true;
    }

    $scope.sortableOptions = {
        update: function (e, ui) {
            var sortBlocked = false;

            if (ui.item.sortable.index < ui.item.sortable.dropindex) {
                var dropMin = ui.item.sortable.index;
                var dropMax = ui.item.sortable.dropindex;
            } else {
                var dropMin = ui.item.sortable.dropindex;
                var dropMax = ui.item.sortable.index;
            }

            for (var routeKey in $scope.item.routes) {
                if (routeKey >= dropMin && routeKey <= dropMax && $scope.item.routes[routeKey]['is_locked']) {
                    sortBlocked = true;
                }
            }

            if (sortBlocked) {
                ui.item.sortable.cancel();
            }
        },
        axis: 'y'
    };

    $scope.addRoute = function () {
        $scope.item.routes.push({a_number_id: null, b_number_id: null, c_number_id: null, outcome_id: null, cpc_id: null});
    };

    $scope.removeRoute = function (index) {
        $scope.item.routes.splice(index, 1);
    };

    $scope.save = function () {
        if (!$scope.isFormReady) {
            return;
        }

        if (params.id && $scope.initialServerId !== $scope.server.id) {
            alert("Изменения нельзя сохранить, так как вы пытаетесь изменить таблицу маршрутизации, которая находится на другом регионе.");
            return;
        }

        RouteTable.save($scope.item).then(function (response) {
            $modalInstance.close();
        });
    };

    $scope.back = function () {
        $modalInstance.dismiss();
    };

    $scope.addRouteRule = function () {
        $scope.item.routeRules.push({
            trunk_group_id: '',
            allow: $scope.item.destination_route_rule_default_allowed
        });
    };

    $scope.removeRouteRule = function (index) {
        $scope.item.routeRules.splice(index, 1);
    };
};
