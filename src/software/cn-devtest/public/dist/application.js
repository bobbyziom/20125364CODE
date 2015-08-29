'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'cn-devtest';
	var applicationModuleVendorDependencies = [ 
		'ngResource', 
		'ngCookies',  
		'ngAnimate',  
		'ngTouch',  
		'ngSanitize',
		'ngRoute',  
		'ui.router', 
		'ui.bootstrap', 
		'ui.utils', 
		'angular-keenio',
		'ngJustGage'
	];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('admin');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Admin module config
angular.module('admin').run(['Menus',
	function(Menus) {

		Menus.addMenuItem('topbar', 'Locations', 'location', 'item', undefined, false, ['super']);
		
		Menus.addMenuItem('topbar', 'Dashboard', 'dash', 'item', undefined, false, [ 'user', 'admin', 'super']);

		Menus.addMenuItem('topbar', 'Devices', 'devices', 'item', undefined, false, [ 'admin' , 'super']);

	}
]);
'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider', 
	function($stateProvider) {
		// Admin state routing
		$stateProvider.
		state('location', {
			url: '/location',
			templateUrl: 'modules/admin/views/location.client.view.html'
		}).
		state('devices', {
			url: '/devices',
			templateUrl: 'modules/admin/views/admin.client.view.html'
		});
	}
]);
'use strict';

angular.module('admin').controller('AddLocationController', ['$scope', '$modalInstance', 'Location',
	function($scope, $modalInstance, Location) {

		$scope.save = function() {
			
			Location.create($scope.location, function(data) {
				$modalInstance.close();
			});
				
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}
]);
'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$modal', 'Device', 'Keen', 'Imp', 'Authentication',
	function($scope, $modal, Device, Keen, Imp, Authentication) {

		$scope.authentication = Authentication;

		$scope.isAboveAdmin = function() {
			if($scope.authentication.user.roles[0] === 'super' || $scope.authentication.user.roles[0] === 'admin') {
				return true;
			} else {
				return false;
			}
		};

		$scope.refresh = function() {
			$scope.name = '';
			$scope.id = '';
			Device.list(function(data) {
				$scope.devices = data;
			});
			Keen.find(function(data) {
				$scope.keen = data;
			});
		};

		/* $scope methods */

		$scope.addDevice = function() {

			// send config to device and get back device setup
			// then store in database
			Imp.setup($scope.id, function(setup) {
				setup.id = $scope.id;
				setup.name = $scope.name;
				Device.create(setup, function(data) {
					$scope.refresh();
				});
			});

		};	

		$scope.updateDevice = function(id, index) {
			Device.edit(id, $scope.devices[index], function(data) {
				// maybe a toast here to give user feedback
			});
		};

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/admin/views/edit-device.client.view.html',
		      controller: 'EditDeviceController',
		      size: 'lg',
		      resolve: {
		        deviceId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      $scope.refresh();
		    }, function () {
		      $scope.refresh();
		    });

		};

	}
]);
'use strict';

angular.module('admin').controller('EditDeviceController', ['$scope', '$stateParams', '$location', '$modalInstance', 'Device', 'Keen', 'Imp', 'deviceId', 'Authentication',
	function($scope, $stateParams, $location, $modalInstance, Device, Keen, Imp, deviceId, Authentication) {

		$scope.authentication = Authentication;

		/* Controller methods */

		var updateDevice = function() {
			Imp.setBatteryTrigger($scope.device.id, $scope.device.notification.entity.battery.value, function(data) {});
			Imp.setMoistureTrigger($scope.device.id, $scope.device.notification.entity.moisture.value, function(data) {});
		};

		/* $scope methods */

		$scope.addEmail = function() {
			$scope.device.notification.contacts.push($scope.email);
			Imp.addEmail($scope.device.id, $scope.email, function(data) {
				Device.edit($scope.device._id, $scope.device, function() {
					$scope.email = '';
				});
			});
		};

		$scope.removeEmail = function(index) {
			var email = $scope.device.notification.contacts[index];
			Imp.removeEmail($scope.device.id, email, function(data) {
				$scope.device.notification.contacts.splice(index, 1);
				Device.edit($scope.device._id, $scope.device, function() {});
			});
		};

		$scope.remove = function() {
			Device.delete($scope.device._id, function(data) {
				$modalInstance.dismiss();
			});
		};

		$scope.editKeen = function() {
			Keen.edit({ 
				projectId: $scope.keen.projectId, 
				readKey: $scope.keen.readKey 
			}, function() {
				$location.path('admin');
			});
		};

		$scope.save = function() {
			Device.edit($scope.device._id, $scope.device, function(data) {
				updateDevice();
				$modalInstance.close();
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

		$scope.findOne = function() {
			Device.get(deviceId, function(data) {
				$scope.device = data;
			});
		};

	}
]);
'use strict';

angular.module('admin').controller('LocationController', ['$scope', '$modal', 'Authentication', 'Location',
	function($scope, $modal, Authentication, Location) {

		$scope.authentication = Authentication;

		var refresh = function() {
			Location.list(function(data) {
				$scope.locations = data;
			});
		};

		refresh();
		
		$scope.checkUser = function() {
			if($scope.authentication.user.roles[0] !== 'guest') {
				return true;
			} else {
				return false;
			}
		};

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/admin/views/add-location.client.view.html',
		      controller: 'AddLocationController',
		      size: 'lg',
		      resolve: {
		        deviceId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      refresh();
		    }, function () {
		      refresh();
		    });

		};

	}
]);
'use strict';

angular.module('admin').factory('Device', [ '$http',
	function($http) {
		// Device service logic
		// ...

		// Public API
		return {
			
			list: function(callback) {
				$http.get('/devices').success(callback);
			},
			
			create: function(device, callback) {
				$http.post('/devices', device).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/devices/' + id).success(callback);
			},

			get: function(id, callback) {
				$http.get('/devices/' + id).success(callback);
			},

			edit: function(id, device, callback) {
				$http.put('/devices/' + id, device).success(callback);
			}

		};
	}
]);
'use strict';

angular.module('admin').factory('Keen', [ '$http',
	function($http) {
		// Keen service logic
		// ...

		// Public API
		return {
			create: function(keen, callback) {
				$http.post('/keen', keen).success(callback);
			},

			edit: function(keen, callback) {
				$http.put('/keen', keen).success(callback);
			},

			find: function(callback) {
				$http.get('/keen').success(callback);
			}
		};
	}
	
]);
'use strict';

angular.module('admin').factory('Location', [ '$http',
	function($http) {
		// Location service logic
		// ...

		// Public API
		return {
			create: function(location, callback) {
				$http.post('/location', location).success(callback);
			},

			read: function(id, callback) {
				$http.get('/location/' + id).success(callback);
			},

			update: function(id, location, callback) {
				$http.put('/location/' + id, location).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/location/' + id).success(callback);
			},

			list: function(callback) {
				$http.get('/locations').success(callback);
			}



		};
	}
]);
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		/*
		Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
		*/
	}
]);
'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('demo', {
			url: '/demo',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('dash', {
			url: '/dash',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('showDash', {
			url: '/dash/:deviceId',
			templateUrl: 'modules/core/views/dash.client.view.html'
		}).
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

// Core module config
angular.module('core').run(['Menus',
	function(Menus) {
		
	}
]);
'use strict';

angular.module('core').controller('DashControllerController', ['$scope', '$filter', '$location', 'tbkKeen', '$http', 'Imp', 'Device', 'Keen',
	function($scope, $filter, $location, Keen, $http, Imp, Device, Keenio) {

		var _projectId = null; 
		var _readKey = null;

		$scope.interval = 3;

		$scope.read = function() {
			Imp.getReading($scope.eventCollection.id, function(data) {
				$scope.readings = data;
		    	$scope.lastRead = new Date(data.time * 1000);
			});
		};

		$scope.request = function(interval) {

			var keen = new Keen({
		    	projectId: _projectId,
		    	readKey: _readKey
			});

			var queryTable = [ 
			    { amount: 1, semantic: 'days' },
			    { amount: 3, semantic: 'days' },
			    { amount: 1, semantic: 'weeks' },
			    { amount: 2, semantic: 'weeks' },
			    { amount: 1, semantic: 'months' },
			    { amount: 3, semantic: 'months' }
			];

			$scope.read();

			//console.log($scope.eventCollection._id);

			var chart = new Keen.Dataviz()
		    .el(document.getElementById('qual'))
		    .chartType('areachart')
		    .width('auto')
		    .height(400)
		    .chartOptions({
		      hAxis: {
		        chartArea: {
		          height: '100%',
		          left: '0%',
		          top: '0%',
		          width: '100%'
		        },
		        isStacked: true,
		        format:'hh:mm (d. MMM)'
		      }
		    }); 

		    chart.prepare();

		    var _interval = 'hourly';

		    /*
		    if(interval > 2) {
		      _interval = 'hourly';
		    } else {
		      _interval = 'minutely';
		    }
		    */

			var humidity = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.id,
		      timeframe: 'this_' + queryTable[interval-1].amount + '_' + queryTable[interval-1].semantic,
		      targetProperty: 'humidity',
		      interval: _interval
		    });

		    var temp = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.id,
		      timeframe: 'this_' + queryTable[interval-1].amount + '_' + queryTable[interval-1].semantic,
		      targetProperty: 'temp',
		      interval: _interval
		    });

		    var moist = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.id,
		      timeframe: 'this_' + queryTable[interval-1].amount + '_' + queryTable[interval-1].semantic,
		      targetProperty: 'moisture',
		      interval: _interval
		    });

		    var light = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.id,
		      timeframe: 'this_' + queryTable[interval-1].amount + '_' + queryTable[interval-1].semantic,
		      targetProperty: 'lux',
		      interval: _interval
		    });
		 
		 	var batt = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.id,
		      timeframe: 'this_' + queryTable[interval-1].amount + '_' + queryTable[interval-1].semantic,
		      targetProperty: 'battery',
		      interval: _interval
		    });

		    keen.run([moist, temp, light], function(err, res){ // run the queries

		      if (err) {
		        chart.error(err.message);
		      } else {
		        
		        var moist = res[0].result;  // data from second query
		        var temp = res[1].result;  // data from third query
		        var lux = res[2].result;  // data from fourth query

		        var data = [];  // place for combined results
		        var i=0;

		        while (i < moist.length) {

		            data[i]={ // format the data so it can be charted
		                timeframe: temp[i].timeframe,
		                value: [
		                    { category: 'Moisture', result: moist[i].value },
		                    { category: 'Temperature', result: temp[i].value },
		                    { category: 'Lux / 10', result: lux[i].value/10 }
		                ]
		            };
		            if (i === moist.length-1) { // chart the data
		              chart
		                .parseRawData({ result: data })
		                .render();
		            }
		            i++;
		        }
		      }

		    });

		};

		$scope.find = function() {
			Keenio.find(function(_keen) {
				_readKey = _keen.readKey;
				_projectId = _keen.projectId;
				Device.list(function(_data) {

					$scope.eventCollections = _data;
					// if on the demo page
					// show only public flagged devices
					if($location.path() === '/demo') {
						$scope.eventCollections = $filter('filter')($scope.eventCollections, { public: true } );
						$scope.eventCollection = $scope.eventCollections[0];
					} else {
						$scope.eventCollection = $scope.eventCollections[0];
					}

					// begin to load 1 week data
					$scope.request(3);
				});
			});
		};

	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';

angular.module('core').factory('Imp', [ '$http',
	function($http) {
		// Imp service logic
		// ...

		var agentUrl = 'https://agent.electricimp.com/';

		// Public API
		return {
			setup: function(impId, callback) {

				var req = {
					method: 'POST',
					url: agentUrl + impId + '/setup',
					headers: {'Content-Type': 'application/json'},
				};

				$http(req).success(callback);

			},

			getReading: function(impId, callback) {

		      var req = {
		        method: 'GET',
		        url: agentUrl + impId + '/read',
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setKeen: function(impId, keenCollection, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/collection/' + keenCollection,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setDeviceName: function(impId, deviceName, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/name/' + deviceName,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    addEmail: function(impId, email, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/email/add/' + email,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    removeEmail: function(impId, email, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/email/remove/' + email,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setBatteryTrigger: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/battery/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setMoistureTrigger: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/notification/moisture/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setWakingInterval: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/config/interval/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    },

		    setCollectAmount: function(impId, value, callback) {

		      var req = {
		        method: 'POST',
		        url: agentUrl + impId + '/setup/config/collect/' + value,
		        headers: {'Content-Type': 'application/json'}
		      };

		      $http(req).success(callback);

		    }


		};
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Users module config
angular.module('users').run(['Menus',
	function(Menus) {

	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('manage', {
			url: '/manage',
			templateUrl: 'modules/users/views/manage.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				if($scope.authentication.user.roles[0] !== 'guest') {
					$location.path('dash');	
				} else {
					$location.path('demo');
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				if($scope.authentication.user.roles[0] !== 'guest') {
					$location.path('dash');	
				} else {
					$location.path('demo');
				}
				
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('EditUserController', ['$scope', '$modalInstance', 'Userdb', 'userId',
	function($scope, $modalInstance, Userdb, userId) {
		
		$scope.roles = [ 'guest', 'user', 'admin', 'super' ];
		$scope.role = $scope.roles[0];

		$scope.findOne = function() {
			Userdb.find(userId, function(data) {
				$scope.user = data;
				$scope.role = $scope.user.roles[$scope.user.roles.indexOf($scope.user.roles[0])];
			});
		};

		$scope.remove = function() {
			Userdb.delete(userId, function() {
				$modalInstance.close();
			});
		};

		$scope.save = function() {
			$scope.user.roles[0] = $scope.role;
			Userdb.update(userId, $scope.user, function(data) {
				$modalInstance.close();
			});
			
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}
]);
'use strict';

angular.module('users').controller('ManageController', ['$scope', '$modal', 'Authentication', 'Userdb', 
	function($scope, $modal, Authentication, Userdb) {

		$scope.authentication = Authentication;

		var find = function() {
			Userdb.list(function(data) {
				$scope.users = data;
			});
		};

		find();

		$scope.open = function (id) {

		    var modalInstance = $modal.open({
		      animation: true,
		      templateUrl: 'modules/users/views/edit-user.client.view.html',
		      controller: 'EditUserController',
		      size: 'lg',
		      resolve: {
		        userId: function () {
		          return id;
		        }
		      }
		    });

		    modalInstance.result.then(function () {
		      find();
		    }, function () {
		      find();
		    });

		};
		
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

angular.module('users').factory('Userdb', [ '$http',
	function($http) {
		// Userdb service logic
		// ...

		// Public API
		return {
			list: function(callback) {
				$http.get('/users').success(callback);
			},

			find: function(id, callback) {
				$http.get('/users/' + id).success(callback);
			},

			update: function(id, user, callback) {
				$http.put('/users/' + id, user).success(callback);
			},

			delete: function(id, callback) {
				$http.delete('/users/' + id).success(callback);
			}
		};
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);