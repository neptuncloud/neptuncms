'use strict';
var LdapAuth = require('ldapauth-fork');
var AccessToken = require('access-token');
/**
 * Ldap.js controller
 *
 * @description: A set of functions called "actions" for managing `Ldap`.
 */

module.exports = {

  /**
   * Retrieve ldap records.
   *
   * @return {Object|Array}
   */
  info: async(ctx) => {
    console.log(ctx.request.body);
    var user = null;
    var search = strapi.services.session.search({_q:ctx.request.body.token})
    await search.then((res) => {
      if(res.length > 0)
      {
        var session = res[0];
        user = {username:session.Username, email:session.email};
      }
    });
    return user;
  },




  token: async(ctx) => {
    console.log(ctx.request.body);
    
    var search = strapi.services.session.search({_q:ctx.request.body.code})
    var token='Bad code';
    var p = null;
    await search.then((res) => {
      if(res.length > 0)
      {
      var options = {
       site: strapi.config.hostname,
       clientId: 'neptun',
       clientSecret: 'neptun',
       tokenPath: '/api/ldap/token',
       userInfoPath: '/oauth/userinfo',
       accessTokenName: 'token',
       timeBeforeExp: 800
      };
      var access_token = "";
      var refresh_token = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 32; i++)
        access_token += possible.charAt(Math.floor(Math.random() * possible.length));

      for (var i = 0; i < 32; i++)
        refresh_token += possible.charAt(Math.floor(Math.random() * possible.length));

      var expire = Math.floor(new Date() / 1000) + 86400;
      var myToken = {
       access_token: access_token, // your access token
       refresh_token: refresh_token, // your secret refresh token
       expired_in:  86400, // 24 hours
       expired_at: expire // specific unix time token will expire
      }
      var accessToken = new AccessToken(options)
      token = accessToken.token(myToken)
      var session = res[0]
      session.tempcode = '';
      session.access_token = access_token;
      session.refresh_token = refresh_token;
      var upd = strapi.services.session.edit({_id:session._id},session);
      p = new Promise( (resolve,reject) => {
          upd.then((res) => {
             resolve("Updated");
          });      
      });
      }
    });
    if ( p != null ) {
      await p.then((res) => { 
         //console.log(res); 
      });
    }
    return token;
  },


  auth: async (ctx) => {
    console.log(ctx.response);
    var ldap = new LdapAuth({
        url: strapi.config.ldap_url,
        bindDN: strapi.config.ldap_binddn,
        bindCredentials: strapi.config.ldap_bindCredentials,
        searchBase: strapi.config.ldap_searchBase,
        searchFilter: strapi.config.ldap_searchFilter,
        reconnect: true
    });
    var res = 'none';
    var p = new Promise(function(resolve,reject) {
         ldap.authenticate(ctx.request.body.user,ctx.request.body.pass, function(err,user) {
            if(err) {
              resolve({ success: false, message: err });
            } else
            { 
              console.log(user.sAMAccountName);
              
 
              var search = strapi.services.session.search({_q:user.sAMAccountName})
              var code = "";
              var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

              for (var i = 0; i < 32; i++)
                code += possible.charAt(Math.floor(Math.random() * possible.length));
              ldap.close((err) => { console.log(err); });
              search.then((res) => {
                  //console.log(res);
                  var session;       
                  if (res.length == 0) {  
                    session = strapi.services.session.add({Username:user.sAMAccountName, email:user.mail, tempcode:code});
                    session.then((res) => {
                       resolve({ success: true, username: user.sAMAccountName, email: user.mail, code: code });
                    });   
                  } else
                  {
                    session = res[0]
                    session.tempcode = code;
                    var upd = strapi.services.session.edit({_id:session._id},session);
                    upd.then((res) => {
                       resolve({ success: true, username: user.sAMAccountName, email: user.mail, code: code });
                    });
                  }
              });
            }
         });
    });
    await p.then(function(result) {
       res = result; 
       //console.log(res);
    });
    return res;
  }

};
