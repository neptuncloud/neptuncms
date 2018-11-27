'use strict';
const { exec } = require('child_process');
const Netmask = require('netmask').Netmask

module.exports = {

  /**
   * Retrieve ldap records.
   *
   * @return {Object|Array}
   */
  freeip: async(ctx) => {
    console.log(ctx.params.net);
    console.log(ctx.params.mask);
    var freehosts = [];
    var p = new Promise((resolve, reject) => {
      exec('/usr/bin/fping -r0 -aqg '+ctx.params.net+'/'+ctx.params.mask, (err,stdout,stderr) => {
         var block = new Netmask(ctx.params.net+'/'+ctx.params.mask);
         console.log(block);
         var exists = stdout.split('\n')         
         var rx = new RegExp("[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+");
         var existentIp = []
         for(var i = 0; i < exists.length; i++) {
            var found = rx.exec(exists[i]);
            if(found != null) existentIp.push(found[0]);
         }
         block.forEach( (ip, long, index) => {                  
           if(existentIp.indexOf(ip) == -1) 
              freehosts.push(ip);
         })
         console.log(freehosts)
         resolve(freehosts);
      });
    });
    await p.then((res) => {
       freehosts = res;
    });
    return freehosts;
  }

};
