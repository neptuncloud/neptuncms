'use strict';

/**
 * Net.js controller
 *
 * @description: A set of functions called "actions" for managing `Net`.
 */

module.exports = {

  /**
   * Retrieve net records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.net.search(ctx.query);
    } else {
      return strapi.services.net.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a net record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.net.fetch(ctx.params);
  },

  /**
   * Count net records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.net.count(ctx.query);
  },

  /**
   * Create a/an net record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.net.add(ctx.request.body);
  },

  /**
   * Update a/an net record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.net.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an net record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.net.remove(ctx.params);
  }
};
