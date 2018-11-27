'use strict';

/**
 * Adminrecord.js controller
 *
 * @description: A set of functions called "actions" for managing `Adminrecord`.
 */

module.exports = {

  /**
   * Retrieve adminrecord records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.adminrecord.search(ctx.query);
    } else {
      return strapi.services.adminrecord.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a adminrecord record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.adminrecord.fetch(ctx.params);
  },

  /**
   * Count adminrecord records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.adminrecord.count(ctx.query);
  },

  /**
   * Create a/an adminrecord record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.adminrecord.add(ctx.request.body);
  },

  /**
   * Update a/an adminrecord record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.adminrecord.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an adminrecord record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.adminrecord.remove(ctx.params);
  }
};
