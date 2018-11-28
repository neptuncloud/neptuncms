'use strict';

/**
 * Storage.js controller
 *
 * @description: A set of functions called "actions" for managing `Storage`.
 */

module.exports = {

  /**
   * Retrieve storage records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.storage.search(ctx.query);
    } else {
      return strapi.services.storage.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a storage record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.storage.fetch(ctx.params);
  },

  /**
   * Count storage records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.storage.count(ctx.query);
  },

  /**
   * Create a/an storage record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.storage.add(ctx.request.body);
  },

  /**
   * Update a/an storage record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.storage.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an storage record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.storage.remove(ctx.params);
  }
};
