'use strict';

angular.module('core').controller('DashControllerController', ['$scope', 'tbkKeen', '$http', 
	function($scope, Keen, $http) {
		// Controller Logic

		$scope.eventCollections = [ 
			{ name: 'Test CN #5', collection: 'norachirp5', id: 'vgvtHnhr2hBo' }, 
			{ name: 'Test CN #1', collection: 'norachirp1', id: '5Aii6fEu_ZFb' },
			{ name: 'Test breakout', collection: 'norabreakout', id: 'ZwSkK-W-NO1l' },
			{ name: 'Spider', collection: 'spider', id: 'bVqd_PZ_ycqm' }
		];

		$scope.eventCollection = $scope.eventCollections[0]; 

		$scope.read = function() {
			var req = {
		        method: 'GET',
		        url: 'https://agent.electricimp.com/' + $scope.eventCollection.id + '/read',
		        headers: {'Content-Type': 'application/json'}
		      };

		    $http(req).success(function(data) {
		    	$scope.readings = data;
		    });
		};

		var keen = new Keen({
		    projectId: '5506b201672e6c4a103511d7',
		    readKey: '079ea6b01609dadfd51fed7469e34455d2c86e51571e441f3899eb2cab8788c6a2409b83f9f57c467177f8f02144e643556cb2199d6bdce4b28509e07e3617bd6219c7a8292cc915ebaab70a92ee8419125819baa8a52e3264fc0dbfc78f6b65b21c15b061e2271a0b9481f2506c40dd'
		});

		var queryTable = [ 
		    { amount: 1, semantic: 'days' },
		    { amount: 3, semantic: 'days' },
		    { amount: 1, semantic: 'weeks' },
		    { amount: 2, semantic: 'weeks' },
		    { amount: 1, semantic: 'months' },
		    { amount: 3, semantic: 'months' }
		];

		$scope.request = function(interval) {

			$scope.read();

			console.log($scope.eventCollection);

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

		    var _interval;

		    if($scope.interval > 2) {
		      _interval = 'hourly';
		    } else {
		      _interval = 'minutely';
		    }

			var humidity = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.collection,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'humidity',
		      interval: _interval
		    });

		    var temp = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.collection,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'temp',
		      interval: _interval
		    });

		    var moist = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.collection,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'moisture',
		      interval: _interval
		    });

		    var light = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.collection,
		      timeframe: 'this_' + queryTable[$scope.interval-1].amount + '_' + queryTable[$scope.interval-1].semantic,
		      targetProperty: 'lux',
		      interval: _interval
		    });
		 
		 	var batt = new Keen.Query('average', {
		      eventCollection: $scope.eventCollection.collection,
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

		$scope.request(3);

	}
]);