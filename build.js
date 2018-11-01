const fse = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');
const frontMatter = require('front-matter');
const glob = require('glob');
const log = require('./utils/logger');
const { parseOptions } = require('./utils/parser');

/**
 * Build the site
 */
const build = (options = {}) => {
  log.info('Building site...');
  const startTime = process.hrtime();

  const { srcPath, outputPath, site } = parseOptions(options);

  // placeholder index body
  var indexBody = '';
  var indexBod = '';

  // clear destination folder
  fse.emptyDirSync(outputPath);

  // copy assets folder
/*   if (fse.existsSync(`${srcPath}/assets`)) {
    fse.copySync(`${srcPath}/assets`, outputPath);
  } */

  // read pages
  const files = glob.sync('**/*.@(md|ejs|html)', { cwd: `${srcPath}/pages` });
  var count = 6;
  files.reverse();
  files.forEach(file => {
    if(count > 0) {
      var pageData = _buildPage(file, { srcPath, outputPath, site });
      var linkPath = pageData.attributes.path.replaceAll('\\','/');
      indexBody += '## [' + pageData.attributes.title + '](' + linkPath + ')\n';
      indexBody += '### *' + pageData.attributes.date + '* \n';
      indexBody += pageData.attributes.abstract + '\n\n';
      indexBody += '**[Read more...](' + linkPath + ')** \n\n';

      var title = '<h2><a href="' + linkPath + '">' + pageData.attributes.title + '</a></h2>';
      var date = '<h2 style="color: gray; font-size: x-large;"><i>' + pageData.attributes.date + '</i></h2>';
      var body = '<p>' + pageData.attributes.abstract + '</p>';
      var btn = '<div class="row sqs-row"><div class="sqs-block button-block sqs-block-button" data-block-type="53" id="block-yui_3_17_2_7_1471630032837_105825"><div class="sqs-block-content"><a href="' + linkPath + '" class="sqs-block-button-element--small sqs-block-button-element abstract-block-btn" data-initialized="true">Read More →</a></div></div></div>';

      indexBod += '<div class="abstract-block">' + title + date + body + btn + '</div>\n\n<br><br><br>\n\n';
      count--;
    }
  });

  // build the index page
  //_buildIndexPage(indexBody, './public', site, srcPath);
  _buildIndexPage(indexBod, './public', site, srcPath);

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  log.success(`Site built succesfully in ${duration}ms`);
};

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

/**
 * Loads a layout file
 */
const _loadLayout = (layout, { srcPath }) => {
  const file = `${srcPath}/layouts/${layout}.ejs`;
  const data = fse.readFileSync(file, 'utf-8');

  return { file, data };
};

/**
 * 
 * Build the index page
 */
const _buildIndexPage = (content, outputPath, site, srcPath) => {
  let destPath = path.join(outputPath, 'index.html');
  const templateConfig = {
    site,
    page: {}
  };
  let pageContent;
  const pageSlug = destPath.split(path.sep).join('-');
  

  //pageContent = marked(content);
  pageContent = ejs.render(content, templateConfig, {
    filename: `${srcPath}/page-${pageSlug}`
  });

  // render layout with page contents
  const layoutName = 'default';
  const layout = _loadLayout(layoutName, {
    srcPath
  });
  const completePage = ejs.render(
    layout.data,
    Object.assign({}, templateConfig, {
      body: pageContent,
      filename: `${srcPath}/layout=${layoutName}`
    })
  );
  // save the file
  fse.writeFileSync(`${destPath}`, completePage);
}

/**
 * Build a single page
 */
const _buildPage = (file, { srcPath, outputPath, site }) => {
  const fileData = path.parse(file);
  let destPath = path.join(outputPath, fileData.dir);

  // create extra dir if filename is not index
  if (fileData.name !== 'index') {
    destPath = path.join(destPath, fileData.name);
  }

  // create destination directory
  fse.mkdirsSync(destPath);

  // read page file
  const data = fse.readFileSync(`${srcPath}/pages/${file}`, 'utf-8');

  // render page
  const pageData = frontMatter(data);
  const templateConfig = {
    site,
    page: pageData.attributes
  };

  let pageContent;
  const pageSlug = file.split(path.sep).join('-');

  // generate page content according to file type
  switch (fileData.ext) {
    case '.md':
      pageContent = marked(pageData.body);
      break;
    case '.ejs':
      pageContent = ejs.render(pageData.body, templateConfig, {
        filename: `${srcPath}/page-${pageSlug}`
      });
      break;
    default:
      pageContent = pageData.body;
  }

  // render layout with page contents
  const layoutName = pageData.attributes.layout || 'default';
  const layout = _loadLayout(layoutName, {
    srcPath
  });

  const completePage = ejs.render(
    layout.data,
    Object.assign({}, templateConfig, {
      body: pageContent,
      filename: `${srcPath}/layout-${layoutName}`
    })
  );

  // save the html file
  fse.writeFileSync(`${destPath}/index.html`, completePage);
  var linkPath = destPath.replace('public\\','');
  pageData.attributes.path = path.join(linkPath, 'index.html');
  return pageData;
};

module.exports = build;
build();
log.info('Copying pages...');
fse.copySync('./public', '../itdesigner.github.io/posts');
log.info('Copied pages...');