'use strict';

// Users module config
angular.module('users').run(['Menus',
	function(Menus) {
		Menus.addMenuItem('topbar', 'Users', 'manage', 'item', undefined, false, ['super']);
	}
]);