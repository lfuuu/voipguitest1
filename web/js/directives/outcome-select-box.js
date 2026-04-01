(function(){
	app.directive('outcomeSelectBox', selectBox);

	selectBox.$inject = ['List', 'Redirect'];

	function selectBox(List, Redirect) {
		var directive = {
			link: link,
			templateUrl: '/templates/directives/outcome-select-box.html',
			restrict: 'E',
			scope: {
				outcomeModel: '=',
				routeTableModel: '=',
				placeholder: '@',
				default: '@',
				required: '@',
				param: '@',
				disabled: '@',
				server: '@'
			}
		};
		return directive;

		function link(scope, element, attrs) {

			scope.open = openItem;
			modelToValue();

			loadOutcomeList();
			loadRouteTableList();

			scope.$watch('outcomeModel', function(newVal, oldVal){
				if (newVal == oldVal) return;
				modelToValue();
			});

			scope.$watch('routeTableModel', function(newVal, oldVal){
				if (newVal == oldVal) return;
				modelToValue();
			});

			scope.$watch('value', function(newVal, oldVal){
				if (newVal == oldVal) return;

				if (newVal == 'newOutcome') {
					scope.value = oldVal;
					openOutcome(null);
				} else if (newVal == 'newRouteTable') {
					scope.value = oldVal;
					openRouteTable(null);
				}

				valueToModel();
			});

			function modelToValue()
			{
				if (scope.outcomeModel) {
					scope.value = 'oc_' + scope.outcomeModel;
				} else if (scope.routeTableModel) {
					scope.value = 'rt_' + scope.routeTableModel;
				} else {
					scope.value = '';
				}
			}

			function valueToModel()
			{
				if (scope.value.substring(0,3) == 'oc_') {
					scope.outcomeModel = scope.value.substring(3);
					scope.routeTableModel = null;
				} else if (scope.value.substring(0,3) == 'rt_') {
					scope.routeTableModel= scope.value.substring(3);
					scope.outcomeModel = null;
				}
			}

			function loadOutcomeList() {
				List.outcome(scope.server).then(function(data){
					scope.listOutcome = data;
				});
			}

			function loadRouteTableList() {
				List.routeTable(scope.server).then(function(data){
					scope.listRouteTable = data;
				});
			}

			function openItem(itemId) {
				if (itemId.substring(0,3) == 'oc_') {
					openOutcome(itemId.substring(3));
				} else if (itemId.substring(0,3) == 'rt_') {
					openRouteTable(itemId.substring(3));
				}
			}

			function openOutcome(itemId) {
				Redirect.outcomeEdit(itemId).then(function(){
					loadOutcomeList();
				});
			}

			function openRouteTable(itemId) {
				Redirect.routeTableEdit(itemId).then(function(){
					loadRouteTableList();
				});
			}
		}
	}
})();
