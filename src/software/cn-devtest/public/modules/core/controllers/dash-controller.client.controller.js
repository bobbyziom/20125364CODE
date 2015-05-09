'use strict';

angular.module('core').controller('DashControllerController', ['$scope', 'tbkKeen', '$http', 'Imp', 'Device', 'Keen',
	function($scope, Keen, $http, Imp, Device, Keenio) {

		var _projectId = null; 
		var _readKey = null;

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

			//console.log($scope.eventCollection);

			$scope.interval = interval;

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
		    if($scope.interval > 2) {
		      _interval = 'hourly';
		    } else {
		      _interval = 'minutely';
		    }
		    */

			var humidity = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.device.col,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'humidity',
		      interval: _interval
		    });

		    var temp = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.device.col,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'temp',
		      interval: _interval
		    });

		    var moist = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.device.col,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'moisture',
		      interval: _interval
		    });

		    var light = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.device.col,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'lux',
		      interval: _interval
		    });
		 
		 	var batt = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.device.col,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'battery',
		      interval: _interval
		    });

		    keen.run([humidity, moist, temp, batt], function(err, res){ // run the queries

		      if (err) {
		        chart.error(err.message);
		      } else {
		        

		        var humidity = res[0].result;  // data from first query
		        var moist = res[1].result;  // data from second query
		        var temp = res[2].result;  // data from third query
		        var batt = res[3].result;  // data from fourth query

		        var data = [];  // place for combined results
		        var i=0;

		        while (i < humidity.length) {

		            data[i]={ // format the data so it can be charted
		                timeframe: humidity[i].timeframe,
		                value: [
		                    { category: 'Humidity', result: humidity[i].value },
		                    { category: 'Moisture', result: moist[i].value },
		                    { category: 'Temperature', result: temp[i].value },
		                    { category: 'Battery', result: batt[i].value }
		                ]
		            };
		            if (i === humidity.length-1) { // chart the data
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
				console.log(_keen);
				_readKey = _keen.readKey;
				_projectId = _keen.projectId;
				Device.list(function(_data) {
					console.log(_data);
					$scope.eventCollections = _data;
					$scope.eventCollection = $scope.eventCollections[0];
					$scope.request(3);
				});
			});
		};

	}
]);