'use strict';
var vsphere = require('./dist/vsphere');
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

/**
 * vSphere.js controller
 *
 * @description: A set of functions called "actions" for managing `vSphere`.
 */

module.exports = {

  /**
   * Retrieve ldap records.
   *
   * @return {Object|Array}
   */
  get: async(ctx) => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


    var p = new Promise((resolve,reject) => {
    lock.acquire('vsphere',(done) => {

       var hostname = strapi.config.vsphere_host;
       var username = strapi.config.vsphere_user;
       var password = strapi.config.vsphere_pass;

       vsphere.vimService(hostname).then((service) => {
                  console.log(username);
                  console.log(password);
                  service.vimPort.login(service.serviceContent.sessionManager,
                        username, password).then(function(res) {
                           var propertyCollector = service.serviceContent.propertyCollector;
                           var viewManager = service.serviceContent.viewManager;
                           var container = service.serviceContent.rootFolder;
                           var type = ctx.params.type;
                           console.log(container);
                           console.log(viewManager)
                           service.vimPort.createContainerView(viewManager,container,[type],true).then((containerView) => {
                                console.log(containerView);
                                var tSpec = service.vim.TraversalSpec({ path: "view", type: "ContainerView", skip: false })
                                console.log(tSpec);
                                var oSpec = service.vim.ObjectSpec({obj:containerView, skip: true, selectSet: tSpec})
                                console.log(oSpec);
                                var pSpec;
                                if ( type == "ResourcePool" )
                                  pSpec = service.vim.PropertySpec({type:type, pathSet: ["name","owner"]}); else
                                  pSpec = service.vim.PropertySpec({type:type, pathSet: ["name"]}); 

                                console.log(pSpec);
                                var opts = service.vim.RetrieveOptions({maxResults: 1000});
                                console.log(opts);
                                var fSpec = service.vim.PropertyFilterSpec({objectSet:oSpec, propSet:pSpec});
                                console.log(fSpec);
                                service.vimPort.retrieveProperties(propertyCollector, [fSpec]).then((res) => {
                                    service.vimPort.logout(service.serviceContent.sessionManager);
                                    resolve(res);
                                    done();
                                }).catch((err) => {
                                    service.vimPort.logout(service.serviceContent.sessionManager);
                                    resolve(err);
                                    done();
                                });
                           }).catch((err) => {
                              console.log(err);
                              service.vimPort.logout(service.serviceContent.sessionManager);
                              resolve(err);
                              done();
                           });
                        }).catch((err) => {
                            console.log(err)
                            resolve(err);
                            done();
                        });

                    }).catch((err) => {
                         console.log(err);
                         resolve(err);
                         done();
                    });

    });    
    });

    var results = [];
    await p.then((res) => {
       console.log(res)
       for(var i = 0; i < res.length; i++) {
          if(ctx.params.type == "ResourcePool")
          {
            if(res[i].propSet[0].val != 'Resources')  
              results.push(res[i].propSet[1].val.value+'/Resources/'+res[i].propSet[0].val);
          }  else
          if(ctx.params.type == "ClusterComputeResource")
            results.push([res[i].propSet[0].val,res[i].obj.value]); else
            results.push(res[i].propSet[0].val);
       }   
    });
    console.log(results)
    return results;
  }

};
