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
  files.reverse();

  //start preparing the history JSON
  var maxPageEntries = 4;
  var pageEntryIndex = 0;
  var currentPage = 0;
  var historyObj = {};
  historyObj.pages = [];
  var page = { 
    "index": currentPage, 
    "entries": []
  };
  historyObj.pages.push(page);

  // loop through all the found files
  files.forEach(file => {
    
    var entryObj = {};
    var pageData = _buildPage(file, { srcPath, outputPath, site });
    var linkPath = pageData.attributes.path.replaceAll('\\','/');

    entryObj.title = pageData.attributes.title;
    entryObj.date = pageData.attributes.date;
    entryObj.abstract = pageData.attributes.abstract;
    entryObj.path = linkPath;
    entryObj.tags = pageData.attributes.tags;
    entryObj.type = (pageData.attributes.type == undefined) ? 'normal' : pageData.attributes.type;
    entryObj.style = pageData.attributes.style;

    historyObj.pages[currentPage].entries.push(entryObj);

    if(pageEntryIndex < maxPageEntries) {
      pageEntryIndex++;
    } else {
      currentPage++;
      pageEntryIndex= 1;
      var newPage = { 
        "index": currentPage, 
        "entries": []
      };
      historyObj.pages.push(newPage);
    }
  });

  // save the history JSON
  fse.writeFileSync('./public/history.js', 'const history = ' + JSON.stringify(historyObj) + ';');

  // build the index page
  //_buildIndexPage(indexBody, './public', site, srcPath);
  // _buildIndexPage(indexBod, './public', site, srcPath);
  var content = '<br>';
  _buildIndexPage(content, './public', site, srcPath);

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
  const layoutName = 'template';
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