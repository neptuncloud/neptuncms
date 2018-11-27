'use strict';

/**
 * Vmhistory.js controller
 *
 * @description: A set of functions called "actions" for managing `Vmhistory`.
 */

module.exports = {

  /**
   * Retrieve vmhistory records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.vmhistory.search(ctx.query);
    } else {
      return strapi.services.vmhistory.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a vmhistory record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.vmhistory.fetch(ctx.params);
  },

  /**
   * Count vmhistory records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.vmhistory.count(ctx.query);
  },

  /**
   * Create a/an vmhistory record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.vmhistory.add(ctx.request.body);
  },

  /**
   * Update a/an vmhistory record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.vmhistory.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an vmhistory record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.vmhistory.remove(ctx.params);
  }
};
