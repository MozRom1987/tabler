module.exports = function (eleventyConfig) {
    // Pass through CSS, JS, Images, Fonts
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/fonts");
    eleventyConfig.addPassthroughCopy("src/favicon.ico");
    eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
    eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
    eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });
    eleventyConfig.addPassthroughCopy({ "src/policy.html": "agd/policy.html" });

    return {
        pathPrefix: "/agd/",
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_layouts"
        },
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk"
    };
};
