const pluginSass = require('eleventy-plugin-sass');
const htmlmin = require('html-minifier');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSass, {
    watch: ['src/assets/**/*.{scss,sass}'],
    outputDir: 'dist/assets'
  });

  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if (outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.setTemplateFormats('html');
  eleventyConfig.addPassthroughCopy('src/data');
  eleventyConfig.addPassthroughCopy('src/assets/**/*.{js,png}');
  eleventyConfig.addPassthroughCopy({ 'src/assets/favicon.svg': 'favicon.svg' });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      data: 'data',
      layouts: 'layouts'
    }
  }
};
