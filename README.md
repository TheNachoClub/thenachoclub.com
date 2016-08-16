# The Nacho Club

This is where The Nacho Club's new website lives. It's a work in progress, and
it's going to be a static site hosted through GitHub pages.

All of the members are at least a little bit technical, so this is going to be a
way to expand our skills by taking the technical stuff in-house.


## Progress

Work being done is tracked [on our Trello board][trello-board].


## Development

Under the hood here is a static site built using [Metalsmith][metalsmith],
[Handlebars][handlebars], [Gulp][gulp] and [SASS][sass].

To get up and running for development:

1. `git clone https://github.com/TheNachoClub/thenachoclub.com.git`
2. `cd thenachoclub.com`
3. Ensure your machine is using Node `^6.3.0`, with NPM `^3.10.0`
4. Install dependencies with `npm install`
5. Run a development server with `gulp serve`

It should automatically open a tab with a running local webserver using
[Browser Sync][browser-sync]. Go nuts!


## Deployment

This site will be hosted with [GitHub Pages][github-pages]. Anything in the
`master` branch will automatically be synced to the live site, while `develop`
will be the merging branch for our source files. To deploy, we push the `build`
directory from `develop` over as the root of `master`. There's a script for it.

While in the `develop` branch, run: `./bin/deploy.sh`.

Then go check out [thenachoclub.com][the-nacho-club] to see your changes.

[metalsmith]: (http://www.metalsmith.io/)
[handlebars]: (http://handlebarsjs.com/)
[sass]: (http://sass-lang.com/)
[gulp]: (http://gulpjs.com/)
[browser-sync]: (https://www.browsersync.io/)
[trello-board]: (https://trello.com/b/IfaflIpq/the-nacho-club)
[github-pages]: (https://pages.github.com/)
[the-nacho-club]: (http://thenachoclub.com)