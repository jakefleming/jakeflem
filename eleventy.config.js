// Eleventy configuration — https://www.11ty.dev/docs/config/
//
// HTML is built by Eleventy from the Nunjucks templates in src/.
// CSS (Sass) and JS (esbuild) are built by the npm scripts in package.json
// and written straight into the output dir, so here we only need to copy
// the static assets and tell the dev server to watch the source files.
module.exports = function (eleventyConfig) {
  // Copy assets through to the build untouched.
  eleventyConfig.addPassthroughCopy({ "src/static": "." }); // favicon, videos, CNAME → site root
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // Live-reload the dev server when the Sass or JS sources change
  // (their compiled output lands in the output dir via the watch scripts).
  eleventyConfig.addWatchTarget("src/stylesheets/");
  eleventyConfig.addWatchTarget("src/javascripts/");

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
};
