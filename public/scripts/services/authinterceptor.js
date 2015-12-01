'use strict';

angular.module('psJwtApp').factory('authInterceptor', function(authToken) {
    return {
        request: function(config) {
            var token = authToken.getToken();
            var name_slug = authToken.getSlug();
            if (token)
                config.headers.Authorization = 'Bearer ' + token + ' ' + 'user_slug ' + name_slug;
            // if (user_slug)
            //     config.headers.user_slug = user_slug;
            return config;
        },
        response: function(response) {
            return response;
        }
    };
});
