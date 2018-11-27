'use strict';

/**
 * Project.js controller
 *
 * @description: A set of functions called "actions" for managing `Project`.
 */

module.exports = {

  /**
   * Retrieve project records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      var projects = [];
	//strapi.services.project.search(ctx.query);
      return projects;
    } else {
      const { _id } = ctx.state.user;
      ctx.query = {owner: _id.toString()};
      var projects_owner = strapi.services.project.fetchAll(ctx.query);
      return projects_owner;
    }
  },

  findOwner: async (ctx) => {
    if (ctx.query._q) {
      var projects = [];
      return projects;
    } else {
      const { _id } = ctx.state.user;
      ctx.query = {owner: _id.toString()};
      var projects_owner = strapi.services.project.fetchAll(ctx.query);
      return projects_owner;
    }
  },

  findAdmin: async (ctx) => {
    if (ctx.query._q) {
      var projects = [];
      return projects;
    } else {
      const { _id } = ctx.state.user;
      ctx.query = {'admins._id': _id.toString()};
      var projects_admin = strapi.services.project.fetchAll(ctx.query);
      return projects_admin;
    }
  },

  /**
   * Retrieve a project record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.project.fetch(ctx.params);
  },

  /**
   * Count project records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.project.count(ctx.query);
  },

  /**
   * Create a/an project record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.project.add(ctx.request.body);
  },

  /**
   * Update a/an project record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.project.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an project record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.project.remove(ctx.params);
  }
};
