import { query } from "./_generated/server";

export const get = query({
    args: {},
    async handler(ctx) {
        return await ctx.db.query("tasks").collect();
    },
})