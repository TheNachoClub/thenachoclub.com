# Bench's Style Guide & Component Library

This is a living document that offers a snapshot at the current state of Bench's
design language. Its goal is to explain the brand underlying design at Bench,
surface the library of components that engineering can re-use in implementation,
and clarify interface patterns that the Bench app makes use of.

Inside you can find documentation, code samples and Sketch files.


## Structure

Here's an overview of the general IA / structure.

```
├── Home
├—— Introduction
├—— Brand
│   ├── Values
│   ├── Color
│   ├── Icons
│   ├── Typography
│   ├── Photography
│   ├── Illustrations
│   ├── Interaction
│   ├── Voice & Tone
├——Components
│   ├── Buttons
│   │   ├── Default
│   │   ├── Primary
│   │   ├── Etc...
│   ├── Badges
│   ├── Alerts
│   ├── Etc...
├——Patterns
│   ├── Confirm Dialog
│   ├── Etc...
├——Resources
│   ├── Master Sketch File
│   ├── Brand Assets
├——Changelog
│   ├── 09-08-2016
│   ├── 08-08-2016
│   ├── Etc...
```


## Contributing

For this to be a living document, we must make this a part of our workflow.
Here's an example of what that might look like for a designer:

1. Design work begins on a new feature of the app
2. Borrow from the master Sketch file to apply existing patterns where possible
3. For new necessary additions to the library, commit the changes to this GitHub
repository in a new branch and then submit a pull request.
4. Tag designers and front-end developers to help review the new addition.

This is not a perfect system but it's the solution we liked most to make
collaborative review a part of our growing design system. Suggestions welcome.


### WTF. How do I use GitHub?

Don't worry, we only need to know a very small subset of GitHub's features to
contribute here. It's cool if you don't know it already and this can be an easy
way to get your feet wet without learning how to be a developer.

If you've never used GitHub at Bench before, ask one of the senior engineering
staff (Slava, Tessa, Jean-Martin or Trevor) to get you access first. Then ask
Rowan (`@rowbot` on Slack) and he'll help you out. Be warned: he's not a GitHub
expert by any means, but he remembers what it's like to be new to it.


## Development

Under the hood here is a static site built using [Metalsmith][metalsmith],
[Handlebars][handlebars], [Gulp][gulp] and [SASS][sass].

To get up and running for development:

1. `git clone https://github.com/BenchLabs/style-guide.git`
2. `cd style-guide`
3. Ensure your machine is using Node `^6.3.0`, with NPM `^3.10.0`
4. Install dependencies with `npm install`
5. Run a development server with `gulp serve`

It should automatically open a tab with a running local webserver using
[Browser Sync][browser-sync]. Go nuts!


## Deployment

TBD.

[metalsmith]: (http://www.metalsmith.io/)
[handlebars]: (http://handlebarsjs.com/)
[sass]: (http://sass-lang.com/)
[gulp]: (http://gulpjs.com/)
[browser-sync]: (https://www.browsersync.io/)