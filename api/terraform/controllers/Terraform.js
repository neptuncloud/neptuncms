'use strict';
let ejs = require('ejs');
var fs = require('fs');
const { spawn } = require('child_process');

module.exports = {

  /**
   * Retrieve ldap records.
   *
   * @return {Object|Array}
   */
  prepare: async(ctx) => {

     console.log(__dirname);
     var p = new Promise((resolve,reject) => {
     fs.readFile(__dirname+'/trfm.template', {encoding: 'utf-8'}, function(err,data) {
        if(err) {
          console.log(err);
          resolve(err);
        } else
        {
        var res = ejs.render(data,
        {
            vsphere_user: strapi.config.vsphere_user,
            vsphere_pass: strapi.config.vsphere_pass,
            vsphere_server: strapi.config.vsphere_host,
            datacenter: ctx.request.body.datacenter,
            datastore: ctx.request.body.datastore,
            resourcepool: ctx.request.body.resourcepool,
            tmpl: ctx.request.body.template,
            vlan: ctx.request.body.vlan,
            vmname: ctx.request.body.vmname,
            vmdomain: strapi.config.vmdomain,
            gateway: ctx.request.body.gateway,
            mask: ctx.request.body.mask,
            ip: ctx.request.body.ip,
            cpu: ctx.request.body.cpu,
            ram: ctx.request.body.ram
        });
        if(!fs.existsSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname))
          fs.mkdirSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname);
        fs.writeFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.tf', res);
        fs.writeFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', '');

        var init = spawn(strapi.config.terraform_executable,['init'],{ cwd: strapi.config.terraform_workdir+'/'+ctx.request.body.vmname });

        init.stdout.on('data', (data) => {
          fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
        });
        init.stderr.on('data', (data) => {
          fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
        });
        init.on('exit', (code) => {
           if(code != 0) resolve(code); else
           {
             var plan = spawn(strapi.config.terraform_executable,['plan', '.'],{ cwd: strapi.config.terraform_workdir+'/'+ctx.request.body.vmname });
             plan.stdout.on('data', (data) => {
               fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
             });
             plan.stderr.on('data', (data) => {
               fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
             });
             plan.on('exit', (code) => {
                resolve(code);
             });
           }
        });

        
        }
    });
    });
    var result = '';
    await p.then((res) => {
       result = res;
    });
    return result;
  },

  provide: async(ctx) => {

     var p = new Promise((resolve,reject) => {

        fs.writeFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', '');

             var apply = spawn(strapi.config.terraform_executable,['apply','-auto-approve', '.'],{ cwd: strapi.config.terraform_workdir+'/'+ctx.request.body.vmname });
             apply.stdout.on('data', (data) => {
               fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
             });
             apply.stderr.on('data', (data) => {
               fs.appendFileSync(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', data);
             });
             apply.on('exit', (code) => {
                resolve(code);
             });        
    });
    var result = '';
    await p.then((res) => {
       result = res;
    });
    return result;
  },
  
  showLog: async(ctx) => {

     var p = new Promise((resolve,reject) => {
       fs.readFile(strapi.config.terraform_workdir+'/'+ctx.request.body.vmname+'/'+ctx.request.body.vmname+'.log', {encoding: 'utf-8'}, function(err,data) {
          if(err) {
            console.log(err);
            resolve(err);
          } else
          {
            resolve(data);        
          }
       });
    });
    var result = '';
    await p.then((res) => {
       result = res;
    });
    return result;
  }


};
