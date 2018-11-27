'use strict';

/**
 * Session.js controller
 *
 * @description: A set of functions called "actions" for managing `Session`.
 */

module.exports = {

  /**
   * Retrieve session records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.session.search(ctx.query);
    } else {
      return strapi.services.session.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a session record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.session.fetch(ctx.params);
  },

  /**
   * Count session records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.session.count(ctx.query);
  },

  /**
   * Create a/an session record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.session.add(ctx.request.body);
  },

  /**
   * Update a/an session record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.session.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an session record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.session.remove(ctx.params);
  }
};
