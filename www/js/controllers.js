angular.module('housediary.controllers', ['openfb'])
    .run(function($http) {
        $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w';
        //$http.defaults.headers.get.NewHeader = 'afsf';
    })
    //.config(function($httpProvider){
    //    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //})

    .controller('MenuCtrl', function ($scope, $state) {
        $scope.menus = [
            {name:'Home', state:'app.home', iconCss:'ion-home'},
            {name:'My Diary', state:'app.login', iconCss:'ion-person'}
        ]
    })

    .controller('HomeCtrl', function ($scope, $state) {
        $scope.title = "House Diary";
        $scope.content = "House Diary"
    })

    .controller('UserHomeControl', function ($scope, $location, OpenFB, $filter, $q, $http) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream,read_friendlists,user_friends').then(
                function () {
                    OpenFB.get('/me/?fields=id,email').success(function (user) {
                        $scope.user = user;
                        $scope.findFriends();
                        console.log(JSON.stringify(user))
                    });
//                    $location.path('/app/person/me/feed');
                },
                function () {
                    alert('OpenFB login failed');
                });

        };

        $scope.findFriends = function () {
            OpenFB.get('/' + $scope.user.id + '/friends', {limit: 50})
                .success(function (result) {
                    $scope.friends = result.data;
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };

        $scope.yammerLogin = function () {
            yam.login({loginType: "session"}, function(response)
            {
                alert(response);
            });
        };

        $scope.yammerGetLoginStatus = function() {

            yam.getLoginStatus(
                function(response) {
                    if (response.authResponse) {

                        $scope.yammerUser = response.user;
//                        $scope.yammerResults = response.authResponse;
                        console.log("logged in");
                        $scope.yammerGetRelations();
//                        yam.platform.request({
//                            url: "users/current.json",     //this is one of many REST endpoints that are available
//                            method: "GET",
//                            data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site
////                                "letter": "a",
////                                "page": "2",
//                            },
//                            success: function (user) { //print message response information to the console
////                                alert("The request was successful.");
//                                $scope.yammerUser = response;
//                                console.dir(user);
//                            },
//                            error: function (user) {
//                                alert("There was an error with the request.");
//                            }
//                        });
                    }
                    else {
                        $scope.yammerUser = "hello1";
                        $scope.yammerLogin(
                            function()
                            {
                                $scope.yammerUser = "hello1";
                                $scope.yammerGetLoginStatus();
                            }
                        );
//                        alert("not logged in")
                    }
                }
            );
        };

        $scope.yammerGetRelations = function() {

            yam.platform.request({
                url: "subscriptions",     //this is one of many REST endpoints that are available
                method: "GET",
                data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site
                    "target_type": "user",
//                                "page": "2",
                },
                success: function (user) { //print message response information to the console
                    console.dir(user);
                    //$scope.yammerFriends = user.subscriptions;
                    var friends  = $filter('filter')(user.subscriptions, {target_type: 'user'});

                    var tmp = [];
                    angular.forEach(friends, function(response) {
                        tmp.push(response.target_id);
                    });

                    $scope.getAllYammerFriendProfiles(tmp)
                        .then(
                        function(data) {
                            $scope.yammerFriends = data;
                        },
                        function(error) {
                            console.log(error);
                        },
                        function(update) {
                            console.log(update);
                        });

                    $scope.$apply();
                },
                error: function (user) {
                    alert("There was an error with the request.");
                }
            });

        };

        $scope.getAllYammerFriendProfiles = function(urls)
        {
            var deferred = $q.defer();

            var urlCalls = [];
            angular.forEach(urls, function(url) {
                urlCalls.push(
                    yam.platform.request({
                        //url: "users"+url+".json",     //this is one of many REST endpoints that are available
                        url: "users/" + url + ".json",
                        method: "GET"
//                        data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site
//                            "target_type": "user",
////                                "page": "2",
//                        },
                    }).xhr)
            });

            // they may, in fact, all be done, but this
            // executes the callbacks in then, once they are
            // completely finished.
            $q.all(urlCalls)
                .then(
                function(results) {
                    deferred.resolve(results)
                },
                function(errors) {
                    deferred.reject(errors);
                },
                function(updates) {
                    deferred.update(updates);
                });
            return deferred.promise;
        };

    })

    .controller('ShareCtrl', function ($scope, OpenFB) {

        $scope.item = {};

        $scope.share = function () {
            OpenFB.post('/me/feed', $scope.item)
                .success(function () {
                    $scope.status = "This item has been shared on OpenFB";
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };

    })

    .controller('ProfileCtrl', function ($scope, OpenFB) {
        OpenFB.get('/me').success(function (user) {
            $scope.user = user;
        });
    })

    .controller('PersonCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId).success(function (user) {
            $scope.user = user;
        });
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/friends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('MutualFriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/mutualfriends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('FeedCtrl', function ($scope, $stateParams, OpenFB, $ionicLoading) {

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading feed...'
            });
        };
        $scope.hide = function(){
            $scope.loading.hide();
        };

        function loadFeed() {
            $scope.show();
            OpenFB.get('/' + $stateParams.personId + '/home', {limit: 30})
                .success(function (result) {
                    $scope.hide();
                    $scope.items = result.data;
                    // Used with pull-to-refresh
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function(data) {
                    $scope.hide();
                    alert(data.error.message);
                });
        }

        $scope.doRefresh = loadFeed;

        loadFeed();

    });