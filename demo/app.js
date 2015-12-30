/**
* demoApp Module
*
* Description
*/
angular.module('demoApp', [
	'harrie.mdeditor'
])
.controller('demoCtrl', ['$scope', function($scope){
	$scope.text='### 标题\n'+
				'```\nconsole.log(Array.every(classes, Boolean));\n```\n'+
				'```javascript\nconsole.log(Array.every(classes, Boolean));\n```\n'+
				'```xml\n<html>\n\t<head>\n\t</head>\n\t<body>\n\t</body>\n</html>\n```';
}]);