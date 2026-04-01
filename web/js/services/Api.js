function basicApiFunctions($q, ApiLoader, $rootScope, url, list, promise) {
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (data) {
            if (promise !== undefined) return promise;

            if (!data.server_id) {
                data.server_id = $rootScope.server.id;
            }

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                data = data || {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', {id: id});
        }
    };
};

app.factory('Attribute', function ($q, ApiLoader, $rootScope) {
    var url = '/json/attribute/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {server_id: $rootScope.server.id};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('SmsTrunk', function ($q, ApiLoader, $rootScope) {
  var url = '/json/sms/sms/';
  var list = undefined;
  var promise = undefined;

  return {
    read: function (data) {
      return ApiLoader.post(url + 'read', data);
    },

    get: function (data) {
      return ApiLoader.post(url + 'get', data);
    },

    list: function (data) {
      if (promise !== undefined) return promise;

      if (!data) data = {};
      if (!data.server_id) {
        data.server_id = 9;
      }

      var deferred = $q.defer();
      if (list !== undefined) {
        deferred.resolve(list);
        return deferred.promise;
      } else {
        ApiLoader.post(url + 'list', data)
          .then(function (data) {
            list = data;
            promise = undefined;
            deferred.resolve(data);
          }, function (data) {
            promise = undefined;
            deferred.reject(data);
          });
        promise = deferred.promise;
      }
      return deferred.promise;
    },

    listByServer: function (server_id) {
      var data = { server_id: $rootScope.server.id };
      return ApiLoader.post(url + 'list', data);
    },

    save: function (data) {
      list = undefined;
      return ApiLoader.post(url + 'save', data);
    },

    delete: function (id) {
      list = undefined;
      return ApiLoader.post(url + 'delete', { id: id });
    },

    // ---------- Конфиги SMPP ----------
    // GET список
    getSmppConfig: function () {
      return ApiLoader.post(url + 'get-configuration-trunks-smpp', {});
    },
    // POST создать
    addSmppConfiguration: function (data) {
      return ApiLoader.post(url + 'add-configuration-trunk-smpp', data);
    },
    // PUT изменить (ожидает { trunk_id, name, host, port, smsc-username, smsc-password })
    modifySmppConfiguration: function (data) {
      return ApiLoader.post(url + 'modify-configuration-trunk-smpp', data);
    },
    // DELETE удалить (ожидает { trunk_id })
    deleteSmppConfiguration: function (data) {
      return ApiLoader.post(url + 'delete-configuration-trunk-smpp', data);
    },

    // ---------- Конфиги REST/API ----------
    // GET список
    getApiConfig: function () {
      return ApiLoader.post(url + 'get-configuration-trunks-api', {});
    },
    // POST создать
    addApiConfiguration: function (data) {
      return ApiLoader.post(url + 'add-configuration-trunk-api', data);
    },
    // PUT изменить (ожидает { trunk_id, name, url, method, contentType, autorization-token })
    modifyApiConfiguration: function (data) {
      return ApiLoader.post(url + 'modify-configuration-trunk-api', data);
    },
    // DELETE удалить (ожидает { trunk_id })
    deleteApiConfiguration: function (data) {
      return ApiLoader.post(url + 'delete-configuration-trunk-api', data);
    },

    // ---------- Прочее ----------
    readByGate: function (params) {
      var gateId = params && params.sms_gate_id;
      if (gateId == null || gateId === '') {
        return this.read({});
      } else {
        return ApiLoader.post(url + 'read-by-gate', { sms_gate_id: gateId });
      }
    }
  };
});

app.factory('TestSmsPricelist', function ($q, ApiLoader, $rootScope) {
  var url = '/json/sms/test-sms-pricelist-list/';

  var listCache  = undefined;
  var listPromise = undefined;

  return {
    read: function (data) {
      return ApiLoader.post(url + 'read', data);
    },
    get: function (data) {
      return ApiLoader.post(url + 'get', data);
    },
    result: function (data) {
      return ApiLoader.post(url + 'result', data);
    },
    numberResult: function (data) {
      return ApiLoader.post(url + 'number-result', data);
    },
    list: function () {
      if (listPromise !== undefined) return listPromise;

      var deferred = $q.defer();
      if (listCache !== undefined) {
        deferred.resolve(listCache);
        return deferred.promise;
      } else {
        var data = { server_id: $rootScope.server.id };
        ApiLoader.post(url + 'list', data)
          .then(function (res) {
            listCache   = res;
            listPromise = undefined;
            deferred.resolve(res);
          }, function (err) {
            listPromise = undefined;
            deferred.reject(err);
          });
        listPromise = deferred.promise;
      }
      return deferred.promise;
    },
    save: function (data) {
      listCache = undefined;
      return ApiLoader.post(url + 'save', data);
    },
    delete: function (id) {
      listCache = undefined;
      return ApiLoader.post(url + 'delete', { id: id });
    },
  };
});



app.factory('SmsGate', function ($q, ApiLoader) {
    var url = '/json/sms/sms-gate/';
    var list = undefined;
    var promise = undefined;

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },

        list: function (data) {
            if (promise !== undefined) return promise;

            data = data || {};
            var deferred = $q.defer();

            if (list !== undefined) {
                deferred.resolve(list);
                promise = undefined;
            } else {
                ApiLoader.post(url + 'read', data)
                    .then(function (response) {
                        list = response;
                        promise = undefined;
                        deferred.resolve(response);
                    }, function (error) {
                        promise = undefined;
                        deferred.reject(error);
                    });
                promise = deferred.promise;
            }

            return deferred.promise;
        },

        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },

         get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },

        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});


app.factory('A2pSmsCdr', function(ApiLoader) {
    var url = '/json/sms/a2p-sms-cdr/';
    return {
      read: function(params) {
        return ApiLoader.post(url + 'read', params);
      }
    };
  });
  

app.factory('SmscCdr', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/smsc-cdr/';
    var list = undefined;
    var promise = undefined;
    
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (data) {
            if (promise !== undefined) return promise;

            if (!data.server_id) {
                data.server_id = $rootScope.server.id;
            }

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                data = data || {};
                ApiLoader.post(url + 'list', data)
                    .then(function (response) {
                        list = response;
                        promise = undefined;
                        deferred.resolve(response);
                    }, function (error) {
                        promise = undefined;
                        deferred.reject(error);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        listByServer: function (server_id) {
            var data = { server_id: $rootScope.server.id };
            return ApiLoader.post(url + 'list', data);
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        dcOptions: function() {
            return ApiLoader.post(url + 'dc-options');
        },
        protoOptions: function() {
            return ApiLoader.post(url + 'proto-options');
        },
        raw: function(data) {
            return ApiLoader.get('/json/sms/sms-raw/raw', data);
        }
    };
});

app.factory('SmsCdr', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/sms-cdr/';
    var list = undefined;
    var promise = undefined;
    
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },     
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (data) {
            if (promise !== undefined) return promise;

            if (!data.server_id) {
                data.server_id = $rootScope.server.id;
            }

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                data = data || {};
                ApiLoader.post(url + 'list', data)
                    .then(function (response) {
                        list = response;
                        promise = undefined;
                        deferred.resolve(response);
                    }, function (error) {
                        promise = undefined;
                        deferred.reject(error);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        listByServer: function (server_id) {
            var data = { server_id: $rootScope.server.id };
            return ApiLoader.post(url + 'list', data);
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        dcOptions: function() {
            return ApiLoader.post(url + 'dc-options');
        },
        protoOptions: function() {
            return ApiLoader.post(url + 'proto-options');
        },
        raw: function(data) {
            return ApiLoader.get('/json/sms/sms-raw/raw', data);
        }
    };
});


app.factory('SmsRouteTable', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/sms-route-table/';
    var list = undefined;
    var promise = undefined;
    return basicApiFunctions($q, ApiLoader, $rootScope, url, list, promise);
});

app.factory('SmsOutcome', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/sms-outcome/';
    var list = undefined;
    var promise = undefined;
    return basicApiFunctions($q, ApiLoader, $rootScope, url, list, promise);
});

app.factory('SmsConnectorType', function ($q, ApiLoader) {
  var url     = '/json/sms/connector-type/';
  var list    = undefined;
  var promise = undefined;

  return {
    read: function (data) {
      return ApiLoader.post(url + 'read', data);
    },

    list: function (data) {
      if (promise) return promise;
      data = data || {};
      var deferred = $q.defer();

      if (list) {
        deferred.resolve(list);
        promise = undefined;
      } else {
        ApiLoader.post(url + 'read', data)
          .then(function (response) {
            list    = response;
            promise = undefined;
            deferred.resolve(response);
          }, function (error) {
            promise = undefined;
            deferred.reject(error);
          });
        promise = deferred.promise;
      }
      return deferred.promise;
    }
  };
});

    app.factory('SmsConnectorProto', function($q, ApiLoader) {
    var url     = '/json/sms/connector-proto/';
    var list    = undefined;
    var promise = undefined;

    return {
        list: function() {
        if (promise) return promise;
        var deferred = $q.defer();
        if (list) {
            deferred.resolve(list);
            promise = undefined;
        } else {
            ApiLoader.post(url + 'read').then(function(response) {
            list    = response;
            promise = undefined;
            deferred.resolve(response);
            }, function(err) {
            promise = undefined;
            deferred.reject(err);
            });
            promise = deferred.promise;
        }
        return deferred.promise;
        }
    };
    });


app.factory('SmsList', function (SmsTrunk, SmsRouteTable, SmsOutcome, SmsTestGroup,SmsTestAuth,SmsGate,SmsConnectorType, SmsConnectorProto) {
    return {
        trunk: function (data) {
            return SmsTrunk.list(data);
        },
        routeTable: function(data) {
      data = data || {};
      data.server_id = 9;
      return SmsRouteTable.list(data);
    },

    outcome: function(data) {
      data = data || {};
      data.server_id = 9;
      return SmsOutcome.list(data);
    },
        testGroup: function (data) {
            return SmsTestGroup.list(data);
        },
        testAuth: function (data) {
            return SmsTestAuth.list(data);
        },
        trunkByServer: function (serverId) {
      // если serverId === null или undefined — подставляем константу
      var sid = (serverId != null ? serverId : SERVER_ID);
      return SmsTrunk.listByServer(sid);
    },
        outcomeType: function () {
            return [
                { id: 1, name: 'ACCEPT' },
                { id: 2, name: 'REJECT' },
                { id: 3, name: 'TEMP NAME' },
            ];
        },
        gateways: function (data) {
            return SmsGate.list(data);
        },
        

    connectorTypes: function(data) {
      data = data || {};                        
      return SmsConnectorType.list().then(function(types) {
        var gate = data.sms_gate_id;
        var filtered;
        if (gate === 1) {                  
          filtered = types.filter(function(t){
            return t.type === 'operator' || t.type === 'internal';
          });
        }
        else if (gate === 2) {               
          filtered = types.filter(function(t){
            return t.type === 'agregat' || t.type === 'client';
          });
        }
        else {
          filtered = types;
        }
        return filtered.map(function(t){
          return {
            id:          t.id,
            name:        t.description,
            type:        t.type
          };
        });
      });
    },
    connectorProtos: function() {
  return SmsConnectorProto.list().then(function(protos) {
    return protos.map(function(p) {
      return {
        id:   p.id,
        name: p.description,
        type: p.type
      };
    });
  });
},
    };
});

app.factory('BillingServer', function ($q, ApiLoader) {
  var url     = '/json/billingservers/',
      list    = undefined,
      promise = undefined;

  return {
    // Получить все серверы
    read: function () {
      return ApiLoader.post(url + 'read');
    },
    // Получить один сервер по данным { id: ... }
    get: function (data) {
      return ApiLoader.post(url + 'get', data);
    },
    // Кешированный список (аналог read, но кешируется)
    list: function () {
      if (promise !== undefined) return promise;
      var deferred = $q.defer();
      if (list !== undefined) {
        deferred.resolve(list);
      } else {
        ApiLoader.post(url + 'read', {})
          .then(function (data) {
            list    = data;
            promise = undefined;
            deferred.resolve(data);
          }, function (err) {
            promise = undefined;
            deferred.reject(err);
          });
        promise = deferred.promise;
      }
      return deferred.promise;
    },
    // Сохранить (создать/обновить) — сбрасывает кеш
    save: function (data) {
      list = undefined;
      return ApiLoader.post(url + 'save', data);
    },
    // Удалить — сброс кеша
    delete: function (id) {
      list = undefined;
      return ApiLoader.post(url + 'delete', { id: id });
    },
     enable: function(id) {
      list = undefined;
      return ApiLoader.post(url + 'enable-antifraud', { id: id });
    },
    // Отключить antifraud
    disable: function(id) {
      list = undefined;
      return ApiLoader.post(url + 'disable-antifraud', { id: id });
    }
  };
});



app.factory('SmsTestAuth', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/test-auth/';
    var list = undefined;
    var promise = undefined;
    var functions = basicApiFunctions($q, ApiLoader, $rootScope, url, list, promise);

    functions.result = function (data) {
        list = undefined;
        return ApiLoader.post(url + 'result', data);
    };
    
    functions.descend = function (data) {
        list = undefined;
        return ApiLoader.post(url + 'descend', data);
    };

    return functions;
});

app.factory('SmsTestGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sms/test-group/';
    var list = undefined;
    var promise = undefined;
    return basicApiFunctions($q, ApiLoader, $rootScope, url, list, promise);
});


app.factory('AttributeGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/attribute-group/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {server_id: $rootScope.server.id};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', {id: id});
        }
    };
});

app.factory('Trunk', function ($q, ApiLoader, $rootScope) {
    var
        url = '/json/trunk/',
        list = undefined,
        promise = undefined;

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        readMarketplace: function (data) {
            return ApiLoader.post(url + 'read-marketplace', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        listByServer: function (server_id) {
            var data = { server_id: server_id };
            return ApiLoader.post(url + 'list', data);
        },
        listByServerWithContract: function (server_id) {
            var data = { server_id: server_id };
            return ApiLoader.post(url + 'list-with-contract', data);
        },
        listNameAndAlias: function (hub_id) {
            var data = { hub_id: hub_id };
            return ApiLoader.post(url + 'list-name-and-alias', data);
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        serviceTrunks: function (trunkId) {
            return ApiLoader.post(url + 'get-service-trunks', { 'trunk_id': trunkId });
        },
        listRoaming: function (servers) {
            return ApiLoader.post(url + 'list-roaming', { 'servers': servers });
        },
        toggleAutorouting: function (trunkId, on) {
            return ApiLoader.post(url + 'toggle-autorouting', { 'trunk_id': trunkId, 'on': on });
        },
        findUsagesInTrunkGroups: function (id) {
            return ApiLoader.post(url + 'find-usages-in-trunk-groups', { 'id': id });
        },
        checkOrmId: function (params) {
            return ApiLoader.post(url + 'check-orm-id', params);
        },
        getList: function (params) {
            return ApiLoader.post(url + 'list', params);
        },
    };
});

app.factory('TrunkGroup', function ($q, ApiLoader, $rootScope) {
    var
        url = '/json/trunk-group/',
        list = undefined,
        promise = undefined;

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        listForMarketplace: function (serverId) {
            if (!serverId && promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                if (!serverId) {
                    serverId = $rootScope.server.id;
                }
                var data = { server_id: serverId };
                ApiLoader.post(url + 'list-for-marketplace', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        findIntoRules: function (data) {
            return ApiLoader.post(url + 'get-trunks-with-group-into-rules', data);
        },
        findIntoRulesRoutingNums: function (data) {
            return ApiLoader.post(url + 'get-trunks-with-group-into-rules-routing-nums', data);
        },
        findIntoRulesAntifraud: function (data) {
            return ApiLoader.post(url + 'get-trunks-with-group-into-rules-antifraud', data);
        },
        findIntoPriorities: function (data) {
            return ApiLoader.post(url + 'get-trunks-with-group-into-priorities', data);
        },
        findRouteTablesWithGroup: function (data) {
            return ApiLoader.post(url + 'get-route-tables-with-group', data);
        },
        findOutcomesWithGroup: function (data) {
            return ApiLoader.post(url + 'get-outcomes-with-group', data);
        },
        findGroupsWithGroup: function (data) {
            return ApiLoader.post(url + 'get-groups-with-group', data);
        },
        findRouteReplaceWithGroup: function (data) {
            return ApiLoader.post(url + 'get-route-replace-with-group', data);
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});


app.factory('ServiceTrunkRouting', function ($q, ApiLoader, $rootScope) {
    var
        url = '/json/service-trunk-routing/';

    return {
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        }
    };
});

    app.factory('Prefixlist', function ($q, ApiLoader, $rootScope) {
    var url = '/json/prefixlist/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
        return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
        return ApiLoader.post(url + 'get', data);
        },
        listBlocked: function (data) {
        return ApiLoader.post(url + 'list-blocked', data);
        },
        list: function () {
        if (promise !== undefined) return promise;

        var deferred = $q.defer();
        if (list !== undefined) {
            deferred.resolve(list);
        } else {
            var data = {
            server_id: ($rootScope.isSms
                ? 99
                : ($rootScope.server.id
                ? $rootScope.server.id
                : $rootScope.serverId))
            };
            ApiLoader.post(url + 'list', data)
            .then(function (data) {
                list = data;
                promise = undefined;
                deferred.resolve(data);
            }, function (err) {
                promise = undefined;
                deferred.reject(err);
            });
            promise = deferred.promise;
        }
        return deferred.promise;
        },

        listEmergency: function () {
        return ApiLoader.post(url + 'list-emergency', {});
        },

        listByType: function (data) {
        return ApiLoader.post(url + 'list-by-type', data);
        },
        listByCamelShared: function (data) {
        return ApiLoader.post(url + 'list-by-camel-shared', data);
        },
        save: function (data) {
        list = undefined;
        return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
        list = undefined;
        return ApiLoader.post(url + 'delete', { id: id });
        },
        nnpCalculation: function (id) {
        return ApiLoader.post(url + 'nnp-calculation', { id: id });
        },
        applyBuffer: function (id) {
        return ApiLoader.post(url + 'apply-buffer', { id: id });
        },
        generatePrefixlist: function (id, type) {
        return ApiLoader.post(url + 'prefixlist-generation', {
            id: id,
            type: type
        });
        },
        findUsagesInNumbers: function (id) {
        return ApiLoader.post(url + 'find-usages-in-numbers', { id: id });
        },
        findUsagesInTrunkABRules: function (id) {
        return ApiLoader.post(
            url + 'find-usages-in-trunk-a-b-rules',
            { id: id }
        );
        }
    };
    });


app.factory('TelemetryReceiver', function ($q, ApiLoader, $rootScope) {
    var url = '/json/corm-adapter/';
    
    return {
        list: function (data) {
            return ApiLoader.post(url + 'list', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        update: function (data) {
            return ApiLoader.post(url + 'update', data);
        },
        delete: function (data) {
            return ApiLoader.post(url + 'delete', data);
        },
        showPrefixes: function (data) {
            return ApiLoader.get(url + 'show-prefixes', { params: data });
        },
    };
});
app.factory('CallsGlue', function($q, $http, $rootScope) {
    var url = '/json/calls-glue/';
    return {
        getJson: function(data) {
            // Отправляем POST-запрос с данными, указываем JSON-заголовок
            return $http.post(url + 'get-json', data, {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };
});



app.factory('ActionLog', function ($q, ApiLoader, $rootScope) {
    var url = '/json/action-log/';
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        getOne: function (data) {
            return ApiLoader.post(url + 'get-one', data);
        },
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        getControllerList: function (data) {
            return ApiLoader.post(url + 'get-controller-list', data);
        },
        getActionList: function (data) {
            return ApiLoader.post(url + 'get-action-list', data);
        },
    };
});

app.factory('User', function ($q, ApiLoader, $rootScope) {
    var url = '/json/user/';
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
    };
});

app.factory('OcaBw', function ($q, ApiLoader, $rootScope) {
    var
        url = '/json/oca-bw/',
        list = undefined,
        promise = undefined;

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Uplink', function ($q, ApiLoader, $rootScope) {
    var url = '/json/uplink/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function () {
            return ApiLoader.post(url + 'read', { as_tree: false });
        },
        readTree: function () {
            return ApiLoader.post(url + 'read', { as_tree: true });
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                ApiLoader.post(url + 'list')
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id, level) {
            return ApiLoader.post(url + 'delete', { id: id, level: level });
        }
    };
});

app.factory('Billing', function (ApiLoader) {
    var url = '/json/billing/';
    return {
        countries: function () {
            return ApiLoader.post(url + 'countries');
        },
        regions: function () {
            return ApiLoader.post(url + 'regions');
        },
        cities: function (geo) {
            return ApiLoader.post(url + 'cities', geo);
        },
        operators: function () {
            return ApiLoader.post(url + 'operators');
        },
        networkTypes: function () {
            return ApiLoader.post(url + 'network-types');
        }
    };
});

app.factory('RouteCase', function ($q, ApiLoader, $rootScope) {
    var url = '/json/route-case/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        findUsagesInOutcomes: function (id) {
            return ApiLoader.post(url + 'find-usages-in-outcomes', { id: id });
        }
    };
});


app.factory('Outcome', function ($q, ApiLoader, $rootScope) {
    var url = '/json/outcome/';
    var listByServer = {};
    var promiseByServer = {};
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (serverId) {
            if (!serverId) {
                serverId = $rootScope.server.id;
            }

            if (promiseByServer[serverId] !== undefined) return promiseByServer[serverId];

            var deferred = $q.defer();
            if (listByServer[serverId] !== undefined) {
                deferred.resolve(listByServer[serverId]);
                return deferred.promise;
            } else {
                var data = { server_id: serverId };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        listByServer[serverId] = data;
                        promiseByServer[serverId] = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promiseByServer[serverId] = undefined;
                        deferred.reject(data);
                    });
                promiseByServer[serverId] = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            listByServer = {};
            promiseByServer = {};
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            listByServer = {};
            promiseByServer = {};
            return ApiLoader.post(url + 'delete', { id: id });
        },
        findUsagesInRouteTables: function (id) {
            return ApiLoader.post(url + 'find-usages-in-route-tables', { id: id });
        }
    };
});


app.factory('Number', function ($q, ApiLoader, $rootScope) {
    var url = '/json/number/';
    var listA = {};
    var listB = {};
    var listC = {};
    var listGT = {};
    var promiseA = {};
    var promiseB = {};
    var promiseC = {};
    var promiseGT = {};

    function getTypeCache(type) {
        if (type == 1 || type == '1') {
            return { list: listA, promise: promiseA };
        } else if (type == 2 || type == '2') {
            return { list: listB, promise: promiseB };
        } else if (type == 3 || type == '3') {
            return { list: listC, promise: promiseC };
        } else if (type == 4 || type == '4') {
            return { list: listGT, promise: promiseGT };
        }

        return null;
    }

    function clearTypeCache(type) {
        if (type == '1') {
            listA = {};
            promiseA = {};
        } else if (type == '2') {
            listB = {};
            promiseB = {};
        } else if (type == '3') {
            listC = {};
            promiseC = {};
        } else if (type == '4') {
            listGT = {};
            promiseGT = {};
        }
    }

    return {
        clearList: function (type) {
            clearTypeCache(type + '');
        },
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (type, serverId ) {
            if (!serverId) {
                serverId = $rootScope.server.id;
            }

            var cache = getTypeCache(type);
            if (!cache) {
                return $q.reject('Unknown number type');
            }

            if (cache.promise[serverId] !== undefined) return cache.promise[serverId];

            var deferred = $q.defer();
            if (cache.list[serverId] !== undefined) {
                deferred.resolve(cache.list[serverId]);
                return deferred.promise;
            } else {
                var data = { server_id: serverId, type_id: type };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        cache.list[serverId] = data;
                        cache.promise[serverId] = undefined;
                        deferred.resolve(cache.list[serverId]);
                    }, function (data) {
                        cache.promise[serverId] = undefined;
                        deferred.reject(data);
                    });
                cache.promise[serverId] = deferred.promise;
            }
            return deferred.promise;
        },
        listByType: function (data) {
            return ApiLoader.post(url + 'list-by-type', data);
        },
        listByServerId: function (serverId) {
            return ApiLoader.post(url + 'list-by-server-id', {server_id: serverId});
        },
        save: function (data) {
            listA = {};
            listB = {};
            listC = {};
            listGT = {};
            promiseA = {};
            promiseB = {};
            promiseC = {};
            promiseGT = {};
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            listA = {};
            listB = {};
            listC = {};
            listGT = {};
            promiseA = {};
            promiseB = {};
            promiseC = {};
            promiseGT = {};
            return ApiLoader.post(url + 'delete', { id: id });
        },
        findUsagesInRouteTables: function (id) {
            return ApiLoader.post(url + 'find-usages-in-route-tables', { id: id });
        },
        findUsagesInTrunkPriority: function (id) {
            return ApiLoader.post(url + 'find-usages-in-trunk-priority', { id: id });
        },
        findUsagesInTrunkRules: function (id) {
            return ApiLoader.post(url + 'find-usages-in-trunk-rules', { id: id });
        },
        findUsagesInStatRules: function (id) {
            return ApiLoader.post(url + 'find-usages-in-stat-rules', { id: id });
        },
        findUsagesInNumberReplace: function (id) {
            return ApiLoader.post(url + 'find-usages-in-number-replace', { id: id });
        }
    };
});

app.factory('NumberAll', function ($q, ApiLoader, $rootScope) {
    var url = '/json/number/';
    var listByServer = {};
    var promiseByServer = {};
    return {
        clearList: function () {
            listByServer = {};
            promiseByServer = {};
        },
        list: function (type, serverId) {
            if (!serverId) {
                serverId = $rootScope.server.id;
            }

            if (promiseByServer[serverId] !== undefined) return promiseByServer[serverId];

            var deferred = $q.defer();
            if (listByServer[serverId] !== undefined) {
                deferred.resolve(listByServer[serverId]);
                return deferred.promise;
            } else {
                var data = { server_id: serverId };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        listByServer[serverId] = data;
                        promiseByServer[serverId] = undefined;
                        deferred.resolve(listByServer[serverId]);
                    }, function (data) {
                        promiseByServer[serverId] = undefined;
                        deferred.reject(data);
                    });
                promiseByServer[serverId] = deferred.promise;
            }
            return deferred.promise;
        }
    };
});

app.factory('Destination', function ($q, ApiLoader, $rootScope) {
    var url = '/json/destination/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Settings', function ($q, ApiLoader) {
    var url = '/json/settings/';

    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        getNasIpAddress: function (serverId) {
            return ApiLoader.post(url + 'get-nas-ip-address', { server_id: serverId });
        }        
    };
});

app.factory('Server', function ($q, ApiLoader) {
    var url = '/json/server/';

    return {
        list: function (data) {
            return ApiLoader.post(url + 'list', data);
        },
        listByHub: function (data) {
            return ApiLoader.post(url + 'list-by-hub', data);
        },
        listByHubWithContract: function (data) {
            return ApiLoader.post(url + 'list-by-hub-with-contract', data);
        },
        checkSyncProgress: function (data) {
            return ApiLoader.post(url + 'check-sync-progress', data);
        }
    };
});

app.factory('ServerOcs', function ($q, ApiLoader) {
    var url = '/json/server-ocs/';

    return {
        list: function (data) {
            return ApiLoader.post(url + 'list', data);
        }
    };
});

app.factory('FmcTrunk', function ($q, ApiLoader) {
    var url = '/json/fmc-trunk/';

    return {
        list: function (data) {
            return ApiLoader.post(url + 'list', data);
        }
    };
});

app.factory('Pbx', function ($q, ApiLoader) {
    var url = '/json/pbx/';

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', { 'servers': data });
        }
    };
});

app.factory('InstanceSettings', function ($q, ApiLoader) {
    var url = '/json/instance-settings/';
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        }
    };
});

app.factory('BlacklistSettings', function ($q, ApiLoader) {
    var url = '/json/blacklist-settings/';
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        add: function (data) {
            return ApiLoader.post(url + 'add', data);
        },
        delete: function (data) {
            return ApiLoader.post(url + 'delete', data);
        },
        check: function (data) {
            return ApiLoader.post(url + 'check', data);
        }
    };
});

app.factory('Airp', function ($q, ApiLoader, $rootScope) {
    var url = '/json/airp/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Cpc', function ($q, ApiLoader, $rootScope) {
    var url = '/json/cpc/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Node', function ($q, ApiLoader, $rootScope) {
    var url = '/json/network/node/',
        list = undefined,
        promise = undefined;
    return {
        read: function () {
            return ApiLoader.post(url + 'read');
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;
            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        create: function (data) {
            return this.save(data);
        },

        update: function (data) {
            return this.save(data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        nodeTypes: function () {
            return ApiLoader.post(url + 'list-node-types');
        },
        nodeStatuses: function () {
            return ApiLoader.post(url + 'list-node-statuses');
        },
        russianCities: function () {
            return ApiLoader.post(url + 'list-russian-cities');
        },
        russianDistricts: function () {
            return ApiLoader.post(url + 'list-russian-districts');
        },
        russianSubjects: function () {
            return ApiLoader.post(url + 'list-russian-subjects');
        },
        serverList: function () {
            return ApiLoader.post(url + 'list-servers');
        },
        listNodesForLink: function () {
            return ApiLoader.post(url + 'list-nodes-for-link');
        }
    };
});

app.factory('Link', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/node-link/',
        list = undefined,
        promise = undefined;
    return {
        read: function() {
            return ApiLoader.post(url + 'read');
        },
        get: function(data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function(data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function(id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Type', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/node-type/';
    return {
        read: function() {
            return ApiLoader.post(url + 'read');
        }
    };
});

app.factory('Status', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/node-status/';
    return {
        // Получение всех статусов (экшен actionRead)
        read: function() {
            return ApiLoader.post(url + 'read');
        }
    };
});

app.factory('City', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/russian-city/';
    return {
        // Получение всех городов (экшен actionRead)
        read: function() {
            return ApiLoader.post(url + 'read');
        }
    };
});

app.factory('District', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/russian-district/';
    return {
        // Получение списка федеральных округов (экшен actionRead)
        read: function() {
            return ApiLoader.post(url + 'read');
        }
    };
});

app.factory('Subject', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/russian-subject/';
    return {
        // Получение всех субъектов РФ (экшен actionRead)
        read: function() {
            return ApiLoader.post(url + 'read');
        }
    };
});

app.factory('TrunkNodeLink', function($q, ApiLoader, $rootScope) {
    var url = '/json/network/trunk-node-link/';
    return {
      read: function() {
        return ApiLoader.post(url + 'read');
      },
      get: function(data) {
        return ApiLoader.post(url + 'get', data);
      },
      save: function(data) {
        return ApiLoader.post(url + 'save', data);
      }
    };
  });


app.factory('Cdr', function ($q,$http, ApiLoader) {
    var url = '/json/cdr/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        getLegs: function (data) {
            return ApiLoader.post(url + 'get-legs', data);
        },
        disconnectCauseList: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'disconnect-cause-list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        ReadAndExport: function(item) {
            var deferred = $q.defer();
            var config = { responseType: 'arraybuffer' }; // Или responseType: 'blob', если вы хотите использовать Blob

            $http.post('/json/cdr/read-and-export', item, config)
                .then(function(response) {
                    var blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = 'CDR_Report_' + new Date().toISOString() + '.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(downloadUrl);
                    document.body.removeChild(a);
                    deferred.resolve();
                }, function(error) {
                    console.error('Export failed', error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    };
});

app.factory('Header', function ($q, ApiLoader, $rootScope) {
    var url = '/json/header/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('HeaderRule', function ($q, ApiLoader, $rootScope) {
    var url = '/json/header-rule/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Mcc', function ($q, ApiLoader, $rootScope) {
    var url = '/json/mcc/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Mnc', function ($q, ApiLoader, $rootScope) {
    var url = '/json/mnc/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        listByMcc: function (data) {
            return ApiLoader.post(url + 'list-by-mcc', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('ReleaseReason', function ($q, ApiLoader, $rootScope) {
    var url = '/json/release-reason/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (type, serverId) {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined && !serverId) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('RouteTable', function ($q, ApiLoader, $rootScope) {
    var url = '/json/route-table/';
    var listByServer = {};
    var promiseByServer = {};
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function (serverId) {
            if (!serverId) {
                serverId = $rootScope.server.id;
            }
            if (promiseByServer[serverId] !== undefined) return promiseByServer[serverId];

            var deferred = $q.defer();
            if (listByServer[serverId] !== undefined) {
                deferred.resolve(listByServer[serverId]);
                return deferred.promise;
            } else {
                var data = { server_id: serverId };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        listByServer[serverId] = data;
                        promiseByServer[serverId] = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promiseByServer[serverId] = undefined;
                        deferred.reject(data);
                    });
                promiseByServer[serverId] = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            listByServer = {};
            promiseByServer = {};
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            listByServer = {};
            promiseByServer = {};
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('RouteReplace', function ($q, ApiLoader, $rootScope) {
    var url = '/json/route-replace/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        saveMultiple: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save-multiple', data);
        },
    };
});

app.factory('TestAuth', function ($q, ApiLoader, $rootScope) {
    var url = '/json/test-auth/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        result: function (data) {
            return ApiLoader.post(url + 'result', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        descend: function (data) {
            return ApiLoader.post(url + 'descend', data);
        },
        clearCache: function () {
            return ApiLoader.post(url + 'clear-cache');
        },
        trace: function (data) {
            return ApiLoader.post(url + 'trace', data);
        }
    };
});

app.factory('TestPricelist', function ($q, ApiLoader, $rootScope) {
    var url = '/json/test-pricelist/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        result: function (data) {
            return ApiLoader.post(url + 'result', data);
        },
        numberResult: function (data) {
            return ApiLoader.post(url + 'number-result', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        descend: function (data) {
            return ApiLoader.post(url + 'descend', data);
        },
        clearCache: function () {
            return ApiLoader.post(url + 'clear-cache');
        },
        trace: function (data) {
            return ApiLoader.post(url + 'trace', data);
        }
    };
});

app.factory('TestGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/test-group/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        result: function (data) {
            return ApiLoader.post(url + 'result', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});


app.factory('LegType', function ($q, ApiLoader, $rootScope) {
    var url = '/json/leg-type/';
    var list = undefined;
    var promise = undefined;
    return {
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        }
    };
});

app.factory('TestPricelistGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/test-pricelist-group/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        result: function (data) {
            return ApiLoader.post(url + 'result', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('TestCall', function ($q, ApiLoader, $rootScope) {
    var url = '/json/test-call/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        result: function (data) {
            return ApiLoader.post(url + 'result', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            list = undefined;
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', { id: id });
        },
        descend: function (data) {
            return ApiLoader.post(url + 'descend', data);
        },
        clearCache: function () {
            return ApiLoader.post(url + 'clear-cache');
        }
    };
});

app.factory('ImsiPartner', function ($q, ApiLoader, $rootScope) {
    var url = '/json/imsi-partner/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('Pricelist', function ($q, ApiLoader, $rootScope, $http) {
    var url = '/json/pricelist/';
    var list = undefined;
    var promise = undefined;

    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        inherit: function (id, name) {
            return ApiLoader.post(url + 'inherit', { id: id, name: name });
        },
        copy: function (id) {
            return ApiLoader.post(url + 'copy', { id: id });
        },
        copyAndMultiply: function (id, multiplier) {
            return ApiLoader.post(url + 'copy-and-multiply', { id: id, multiplier: multiplier });
        },
        updatePrefixPrices: function (id, multiplier, dateFrom, dateTo) {
            return ApiLoader.post(url + 'update-prefix-prices', { id: id, multiplier: multiplier, dateFrom: dateFrom, dateTo: dateTo });
        },
        relations: function(id) {
            return $http.post('/json/pricelist/relations', { id: id }, { responseType: 'json' })
                .then(function(res){ return res.data; }, function(err){ return $q.reject(err); });
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        getInCommerce: function (data) {
            return ApiLoader.post(url + 'get-in-commerce', data);
        },
        getInCommercePackage: function (data) {
            return ApiLoader.post(url + 'get-in-commerce-package', data);
        },
        getInCommercePackageSms: function (data) {
            return ApiLoader.post(url + 'get-in-commerce-package-sms', data);
        },
        getInCommercePackageData: function (data) {
            return ApiLoader.post(url + 'get-in-commerce-package-data', data);
        },

        getWithDependents: function (data) {
            return ApiLoader.post(url + 'get-with-dependents', data);
        },
        getWithDependentsNew: function (data) {
            return ApiLoader.post(url + 'get-with-dependents-new', data);
        },
        getWithDependentsAll: function (data) {
            return ApiLoader.post(url + 'get-with-dependents-all', data);
        },
        toggleActive: function (id) {
            return ApiLoader.post(url + 'toggle-active', { id: id });
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        saveAndUpdate: function (data) {
            return ApiLoader.post(url + 'save-and-update', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        },
        search: function (data) {
            return ApiLoader.post(url + 'search', data);
        },
        oldSearch: function (data) {
            return ApiLoader.post(url + 'old-search', data);
        },
        synchronize: function (data) {
            return ApiLoader.post(url + 'synchronize', data);
        },
        switchTriggerOn: function () {
            return ApiLoader.post(url + 'switch-trigger-on');
        },
        switchTriggerOff: function () {
            return ApiLoader.post(url + 'switch-trigger-off');
        },
        isTriggerEnabled: function () {
            return ApiLoader.post(url + 'is-trigger-enabled');
        },
        notifyEventToAll: function () {
            return ApiLoader.post(url + 'notify-event-to-all');
        }
    };
});

app.factory('OldPricelist', function ($q, ApiLoader, $rootScope) {
    var url = '/json/old-pricelist/';
    var list = undefined;
    var promise = undefined;
    return {
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        }
    };
});

app.factory('PricelistGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/pricelist-group/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('MajorGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/major-group/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('PricelistLocation', function ($q, ApiLoader, $rootScope) {
    var url = '/json/pricelist-location/';
    var list = undefined;
    var promise = undefined;

    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        listByPricelist: function (data) {
            return ApiLoader.post(url + 'list-by-pricelist', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        },
        bulkImport: function (payload) {
            return ApiLoader.post(url + 'bulk-import', payload);
        }
    };
});

app.factory('PricelistFilterA', function ($q, ApiLoader, $rootScope) {
    var url = '/json/pricelist-filter-a/';
    var list = undefined;
    var promise = undefined;
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        saveAndUpdate: function (data) {
            return ApiLoader.post(url + 'save-and-update', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        }
    };
});

app.factory('PricelistFilterB', function ($q, ApiLoader, $rootScope, $http) {
    var url = '/json/pricelist-filter-b/';

    function toObject(maybe) {
        if (maybe == null) return {};
        if (typeof maybe === 'string') {
            try { 
                return JSON.parse(maybe.replace(/^\)\]\}',?\s*/, '')); 
            } catch(e) { 
                return {}; 
            }
        }
        return maybe;
    }

    function unwrap(promise) {
        return $q.when(promise).then(function (res) {
            var data = (res && typeof res === 'object' && 'data' in res) ? res.data : res;
            return toObject(data);
        });
    }

    return {
        read: function (data) { return unwrap(ApiLoader.post(url + 'read', data)); },
        get: function (data) { return unwrap(ApiLoader.post(url + 'get', data)); },
        save: function (data) { return unwrap(ApiLoader.post(url + 'save', data)); },
        saveAndUpdate: function (data) { return unwrap(ApiLoader.post(url + 'save-and-update', data)); },
        delete: function (id) { return unwrap(ApiLoader.post(url + 'delete', { id: id })); },
        deleteHistoryItem: id  => unwrap(ApiLoader.post(url + 'delete-history-with-prefixes', { id: id })),
        bulkImport: function (payload) { return unwrap(ApiLoader.post(url + 'bulk-import', payload)); },
        parseXlsx: function (fileBase64) { return unwrap(ApiLoader.post(url + 'parse-xlsx', { file_base64: fileBase64 })); }
    };
});



app.factory('PricelistPrefixPrice', function ($q, ApiLoader, $rootScope) {
    var url = '/json/pricelist-prefix-price/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        readPage: function (data) {
            return ApiLoader.post(url + 'read-page', data);
        },
        readAll: function (data) {
            return ApiLoader.post(url + 'read-all', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        },
        singleHistory: function (filterBId, prefixB) {
            return ApiLoader.post(url + 'single-history', { pricelist_filter_b_id: filterBId, prefix_b: prefixB });
        }
    };
});

app.factory('Major', function ($q, ApiLoader, $rootScope) {
    var url = '/json/major/';
    var list = undefined;
    var promise = undefined;
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        saveAndUpdate: function (data) {
            return ApiLoader.post(url + 'save-and-update', data);
        },
        delete: function (id) {
            return ApiLoader.post(url + 'delete', { id: id });
        },
        move: function (id, direction) {
            return ApiLoader.post(url + 'move', { id: id, direction: direction });
        },
        findUsagesInPricelists: function (id) {
            return ApiLoader.post(url + 'find-usages-in-pricelists', { id: id });
        },
        test: function (data) {
            return ApiLoader.post(url + 'test', data);
        },
    };
});

app.factory('Network', function ($q, ApiLoader, $rootScope) {
    var url = '/json/network/';
    var list = undefined;
    var promise = undefined;
    return {
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = { server_id: $rootScope.server.id };
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        }
    };
});

app.factory('SimImsi', function ($q, ApiLoader, $rootScope) {
    var url = '/json/sim-imsi/';
    return {
        partner: function (data) {
            return ApiLoader.post(url + 'partner', data);
        },
        profile: function (data) {
            return ApiLoader.post(url + 'profile', data);
        }
    };
});

app.factory('Currency', function ($q, ApiLoader, $rootScope) {
    var url = '/json/currency/';
    return {
        list: function () {
            return ApiLoader.post(url + 'list');
        },
    }
});

app.factory('UvrGroup', function ($q, ApiLoader, $rootScope) {
    var url = '/json/uvr-group/';
    return {
        list: function () {
            return ApiLoader.post(url + 'list');
        },
    }
});

app.factory('List', function (
    Trunk, TrunkGroup, TestGroup, Prefixlist,
    RouteCase, Outcome, Number, NumberAll, Destination,
    Airp, ReleaseReason, RouteTable, Network,
    Attribute, Server, FmcTrunk, Cpc, Hub,
    PricelistGroup, Mcc, Mnc, Pricelist, TestPricelistGroup,
    MajorGroup, Header, HeaderRule, Cdr, OldPricelist, User, ServerOcs, SimImsi, LegType, AlphaNumber, AlphaNumberGroup, Currency, UvrGroup, TelemetryReceiver, SmscCdr, $rootScope, $http
) {
    return {
        trunk: function () {
            return Trunk.list();
        },
        trunkByServer: function (serverId) {
            return Trunk.listByServer(serverId);
        },
        trunkGroup: function () {
            return TrunkGroup.list();
        },
        trunkGroupForMarketplace: function (serverId) {
            return TrunkGroup.listForMarketplace(serverId);
        },
        trunkRoaming: function (servers) {
            return Trunk.listRoaming(servers);
        },
        testGroup: function () {
            return TestGroup.list();
        },
        testPricelistGroup: function () {
            return TestPricelistGroup.list();
        },
        prefixlist: function () {
            return Prefixlist.list();
        },
        prefixlistByType: function (type) {
            return Prefixlist.listByType({ type_id: type });
        },
        prefixlistByCamelShared: function () {
            return Prefixlist.listByCamelShared();
        },
        attribute: function () {
            return Attribute.list();
        },
        routeCase: function () {
            return RouteCase.list();
        },
        a2pSmsCdr: function(params) {
            return A2pSmsCdr.read(params);
          },
        mccOptions: function () {
            return Mcc.list();
        },
        mncOptions: function () {
            return Mnc.list();
        },        
        outcome: function (serverId) {
            return Outcome.list(serverId);
        },
        number: function (type, serverId) {
            return Number.list(type, serverId);
        },
        alphaNumber: function () {
            return AlphaNumber.list();
        },
        alphaNumberGroup: function () {
            return AlphaNumberGroup.list();
        },
        numberClearList: function (type) {
            Number.clearList(type);
        },
        numberAll: function (serverId) {
            return NumberAll.list(serverId);
        },
        destination: function () {
            return Destination.list();
        },
        airp: function () {
            return Airp.list();
        },
        releaseReason: function () {
            return ReleaseReason.list();
        },
        uvrGroup: function () {
            return UvrGroup.list();
        },
        releaseReasonByServerId: function (serverId) {
            return ReleaseReason.list(serverId);
        },
        routeTable: function (serverId) {
            return RouteTable.list(serverId);
        },
        network: function () {
            return Network.list();
        },
        server: function () {
            return Server.list();
        },
        serverOcs: function () {
            return ServerOcs.list();
        },
        fmcTrunk: function () {
            return FmcTrunk.list();
        },
        cpc: function () {
            return Cpc.list();
        },
        pricelistGroup: function () {
            return PricelistGroup.list();
        },
        majorGroup: function () {
            return MajorGroup.list();
        },
        pricelist: function () {
            return Pricelist.list();
        },
        oldPricelist: function () {
            return OldPricelist.list();
        },
        mcc: function () {
            return Mcc.list();
        },
        header: function () {
            return Header.list();
        },
        headerRule: function () {
            return HeaderRule.list();
        },
          listEmergency: function () {
            return Prefixlist.listEmergency();
        },
        disconnectCause: function () {
            return Cdr.disconnectCauseList();
        },
        dcOptions: function () {
            return SmscCdr.dcOptions();
        },
        protoOptions: function () {
            return SmscCdr.protoOptions();
        },
        user: function () {
            return User.read();
        },
        mvnoPartner: function () {
            return SimImsi.partner();
        },
        adapter: function (serverId) {
            return TelemetryReceiver.list({ server_id: serverId }).then(function (data) {
                return data.map(function (adapter) {
                    return {
                        id: adapter.id,
                        name: adapter.name
                    };
                });
            });
        },
        legType: function () {
            return LegType.list();
        },
        currency: function () {
            return Currency.list();
        },
        testResult: function () {
            return [
                { 'id': 'not_executed', 'name': 'Не выполнен' },
                { 'id': 'passed', 'name': 'Успех' },
                { 'id': 'failed', 'name': 'Неудача' }
            ];
        },
        uplinkActiveMode: function () {
            return [
                { 'id': 1, 'name': 'all' },
                { 'id': 2, 'name': 'inc' },
                { 'id': 3, 'name': 'exc' }
            ];
        },
        location: function () {
            return [
                { 'id': '1', 'name': 'Домашний регион' },
                { 'id': '2', 'name': 'Гостевой регион' },
                { 'id': '3', 'name': 'Международный регион' },
                { 'id': '4', 'name': 'MVNO' },
                { 'id': '5', 'name': 'Не использовать' },
                { 'id': '6', 'name': 'Входящие в международном регионе' },
            ];
        },
        origAttribute: function () {
            return [
                { 'id': '1', 'name': 'МГ/МН-о' },
                { 'id': '2', 'name': 'МГ/МН2-о' }
            ];
        },
        termAttribute: function () {
            return [
                { 'id': '3', 'name': 'МГ/МН-т' },
                { 'id': '4', 'name': 'МГ/МН2-т' }
            ];
        },
        headerRuleItemMode: function () {
            return [
                { 'id': '1', 'name': 'Равно' },
                { 'id': '2', 'name': 'Не равно' },
                { 'id': '3', 'name': 'Присутствует' },
                { 'id': '4', 'name': 'Отсутствует' },
                { 'id': '5', 'name': 'Regexp' }
            ];
        },
        timeInterval: function () {
            return [
                { 'id': '60', 'name': 'Искать за последнюю минуту' },
                { 'id': '300', 'name': 'Искать за последние 5 минут' },
                { 'id': '900', 'name': 'Искать за последние 15 минут' },
                { 'id': '1800', 'name': 'Искать за последние 30 минут' },
                { 'id': '3600', 'name': 'Искать за последний час' },
                { 'id': '7200', 'name': 'Искать за последние 2 часа' },
                { 'id': '28800', 'name': 'Искать за последние 8 часов' },
                { 'id': '86400', 'name': 'Искать за последний день' },
                { 'id': '172800', 'name': 'Искать за последние 2 дня' },
                { 'id': '432000', 'name': 'Искать за последние 5 дней' },
                { 'id': '604800', 'name': 'Искать за последние 7 дней' },
                { 'id': '1209600', 'name': 'Искать за последние 14 дней' },
                { 'id': '2592000', 'name': 'Искать за последние 30 дней' },
                { 'id': '0', 'name': 'Искать за все время' }
            ];
        },
        considerPortingMode: function () {
            return [
                { 'id': 1, 'name': 'Пропускать все' },
                { 'id': 2, 'name': 'Пропускать только портированные' },
                { 'id': 3, 'name': 'Пропускать только непортированные' }
            ];
        },
        hub: function () {
            return Hub.list();
        },
    };
});

app.factory('Hub', function ($q, ApiLoader, $rootScope) {
    var url = '/json/hub/';
    return {
        list: function (data) {
            return ApiLoader.post(url + 'list', data);
        }
    };
});

app.factory('Comment', function ($q, ApiLoader, $rootScope) {
    var url = '/json/comment/';
    return {
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        }
    };
});

app.factory('AlphaNumberGroup', function (ApiLoader, $q) {
    var url = '/json/sms/a2p-alpha-number-group/';
    var promise = undefined;
    var list = undefined;
    return {
        get: function(data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        copy: function (id, name) {
            return ApiLoader.post(url + 'copy', { id: id, name: name});
        },
        alphaNumGroupList: function (data) {
            return ApiLoader.post(url + 'list', data);
        },
        listAlphaNumbers: function(id) {
            return ApiLoader.post(url + 'list-alpha-numbers', id);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', {id: id});
        }
    };
});

app.factory('AlphaNumber', function (ApiLoader, $q) {
    var url = '/json/sms/a2p-alpha-numbers/';
    var promise = undefined;
    var list = undefined;
    return {
        get: function(data) {
            return ApiLoader.post(url + 'get', data);
        },
        list: function () {
            if (promise !== undefined) return promise;

            var deferred = $q.defer();
            if (list !== undefined) {
                deferred.resolve(list);
                return deferred.promise;
            } else {
                var data = {};
                ApiLoader.post(url + 'list', data)
                    .then(function (data) {
                        list = data;
                        promise = undefined;
                        deferred.resolve(data);
                    }, function (data) {
                        promise = undefined;
                        deferred.reject(data);
                    });
                promise = deferred.promise;
            }
            return deferred.promise;
        },
        save: function (data) {
            return ApiLoader.post(url + 'save', data);
        },
        alphaNumList: function (data) {
            return ApiLoader.post(url + 'list', data);
        },
        delete: function (id) {
            list = undefined;
            return ApiLoader.post(url + 'delete', {id: id});
        }
    };
});

app.factory('Nnp', function (ApiLoader) {
    var url = '/json/nnp/';
    return {
        destinationList: function () {
            return ApiLoader.post(url + 'destination');
        },
        countryList: function () {
            return ApiLoader.post(url + 'country');
        },
        regionList: function (data) {
            return ApiLoader.post(url + 'region', data);
        },
        cityList: function (data) {
            return ApiLoader.post(url + 'city', data);
        },
        operatorList: function (data) {
            return ApiLoader.post(url + 'operator', data);
        },
        routeMncList: function() {
            return ApiLoader.post(url + 'route-mnc');
        },
        ndcTypeList: function () {
            return ApiLoader.post(url + 'ndc-type');
        },
        sourceList: function () {
            return ApiLoader.post(url + 'source');
        },
        numberSourceList: function () {
            return ApiLoader.post(url + 'number-source');
        },
        numberStatusList: function () {
            return ApiLoader.post(url + 'number-status');
        },
        geoCountryList: function () {
            return ApiLoader.post(url + 'geo-country');
        },
        geoCityList: function (data) {
            return ApiLoader.post(url + 'geo-city', data);
        },
        ndcList: function (data) {
            return ApiLoader.post(url + 'ndc', data);
        },
        destinationList: function (data) {
            return ApiLoader.post(url + 'destination', data);
        }
    };
});

app.factory('StatisticsTree', function ($q, ApiLoader, $rootScope) {
    var url = '/json/statistics-tree/';
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        }
    };
});

app.factory('MoneyTree', function ($q, ApiLoader, $rootScope) {
    var url = '/json/money-tree/';
    return {
        get: function (data) {
            return ApiLoader.post(url + 'get', data);
        }
    };
});

app.factory('Scripts', function ($q, ApiLoader, $rootScope) {
    var url = '/json/scripts/';
    return {
        generateTests: function () {
            return ApiLoader.post(url + 'generate-tests');
        },
        deleteTests: function () {
            return ApiLoader.post(url + 'delete-tests');
        },
        viewTestsLog: function () {
            return ApiLoader.post(url + 'view-tests-log');
        },
    };
});

app.factory('PricelistPrefixPriceHistory', function ($q, ApiLoader, $rootScope) {
    var url = '/json/billing/pricelist-prefix-price-history/';
    return {
        undoImport: function (data) {
            return ApiLoader.post(url + 'undo-import', data);
        },
    };
});

app.factory('PricelistPrefixPriceHistoryItem', function ($q, ApiLoader, $rootScope) {
    var url = '/json/billing/pricelist-prefix-price-history-item/';
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
    };
});

app.factory('PricelistFilterBHistoryItem', function ($q, ApiLoader, $rootScope) {
    var url = '/json/billing/pricelist-filter-b-history-item/';
    return {
        read: function (data) {
            return ApiLoader.post(url + 'read', data);
        },
    };
});

app.factory('PricelistFilterBHistory', function ($q, ApiLoader, $rootScope) {
    var url = '/json/billing/pricelist-filter-b-history/';
    return {
        undo: function (data) {
            return ApiLoader.post(url + 'undo', data);
        },
    };
});

app.filter('belongsToTestGroup', function () {
    return function (items, groupId) {
        if (!items) {
            return [];
        }

        if (!groupId) {
            return items;
        }

        var filtered = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.testgroup_id == groupId) {
                filtered.push(item);
            }
        }

        return filtered;
    };
});

app.filter('testHasResult', function () {
    return function (items, result) {
        if (!items) {
            return [];
        }

        if (!result) {
            return items;
        }

        var filtered = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.is_autotest == true && item.result == result) {
                filtered.push(item);
            }
        }

        return filtered;
    };
});
