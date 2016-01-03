'use strict';

(function () {
    angular.module('homifyApp').factory('ApiService', ApiService);

    ApiService.$inject = ['$http', '$q'];

    function ApiService ($http, $q) {
        var baseApiUrl = 'http://localhost:3000/api/';

        function get(path, params) {
            var q = $q.defer();
            $http({
                method: 'GET',
                url: baseApiUrl + path
            }).then(function(data) {
                q.resolve(data);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        function post(path, postData) {
            var q = $q.defer();
            $http({
                method: 'POST',
                url: baseApiUrl + path,
                data: postData
            }).then(function(data) {
                q.resolve(data);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        var score = {
            get: function() {
                return get('points');
            },
            set: function(val) {
                return post('points', {
                    points: val
                });
            }
        };

        var homework = {
            set: function(done) {
                return post('homework', {
                    complete: done
                });
            }
        };

        return {
            score: score,
            homework: homework
        };
    }
}());