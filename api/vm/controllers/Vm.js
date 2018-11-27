'use strict';

/**
 * Vm.js controller
 *
 * @description: A set of functions called "actions" for managing `Vm`.
 */

module.exports = {

  /**
   * Retrieve vm records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.vm.search(ctx.query);
    } else {
      return strapi.services.vm.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a vm record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.vm.fetch(ctx.params);
  },

  /**
   * Count vm records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.vm.count(ctx.query);
  },

  /**
   * Create a/an vm record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.vm.add(ctx.request.body);
  },

  /**
   * Update a/an vm record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.vm.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an vm record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.vm.remove(ctx.params);
  }
};
