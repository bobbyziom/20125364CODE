'use strict';

// Admin module config
angular.module('admin').run(['Menus',
	function(Menus) {

		Menus.addMenuItem('topbar', 'Devices', 'admin', 'item', undefined, false, ['admin', 'super']);

	}
]);