const langExtensions = () => {
    const figureImg = {
      type: 'lang',
      regex: /!!!\[(.*?)]\((.*?)( =.*?)?\)/g,
      replace: `<figure class="figure text-center">
                  <img src="$2" class="figure-img img-fluid rounded" alt="$1">
                  <figcaption class="figure-caption text-right">$1</figcaption>
                </figure>`
    };
    const fluidImg = {
      type: 'lang',
      regex: /!!\[(.*?)]\((.*?)( =.*?)?\)/g,
      replace: `<img src="$2" class="img-fluid rounded" alt="$1">`
    };
    const button = {
        type: 'lang',
        regex: /#\[(.*?)]\((.*?)\)/g,
        replace: `<a class="btn btn-sm btn-outline-secondary" href="$2">$1</a>`
    };
    const mention = {
        type: 'lang',
        regex: /\s@(.+)/g,
        replace: `<a href="https://www.github.com/$1">$1</a>`
    };
    const mail = {
        type: 'lang',
        regex: /(\S+?@\S+?\.\S+)/g,
        replace: `<a href="mailto:$1">$1</a>`
    };
    return [figureImg, fluidImg, button, mail, mention];
};

const classMap = {
    h1: 'display-1',
    h2: 'display-2',
    h3: 'display-3',
    h4: 'display-4',
    h5: 'h3',
    h6: 'h4',
    table: 'table',
    p: 'lead text-center'
}

const bindings = Object.keys(classMap)
    .map(key => ({
        type: 'output',
        regex: new RegExp(`<${key}(.*)>`, 'g'),
        replace: `<${key} class="${classMap[key]}" $1>`
    }));

const mdConverter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    noHeaderId: true,
    parseImgDimensions: true,
    simpleLineBreaks: true,
    extensions: [...langExtensions(), ...bindings]
});