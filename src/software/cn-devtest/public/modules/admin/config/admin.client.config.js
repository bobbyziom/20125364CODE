'use strict';

// Admin module config
angular.module('admin').run(['Menus',
	function(Menus) {

		Menus.addMenuItem('topbar', 'Locations', 'location', 'item', undefined, false, [ 'user', 'admin', 'super']);
		
		Menus.addMenuItem('topbar', 'Dashboard', 'dash', 'item', undefined, false, [ 'user', 'admin', 'super']);

		Menus.addMenuItem('topbar', 'Devices', 'admin', 'item', undefined, false, [ 'admin' , 'super']);

	}
]);