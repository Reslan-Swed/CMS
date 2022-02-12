function getSubjectPagesCount(subjectId) {
    const positionSelectElement = document.querySelector('#position');
    fetch(`/staff/subjects/${subjectId}/pages/count`)
        .then(response => response.json())
        .then(response => {
            console.log(`response: ${response}`);
            const {options} = positionSelectElement;
            while (options.length) {
                options[0].remove();
            }
            for (let i = 1; i <= +response.subject.totalPages; i++) {
                positionSelectElement.appendChild(new Option(i.toString(), i.toString()));
            }
        }).catch(e => {
        setTimeout(() => getSubjectPagesCount(subjectId), 3000);
    });
}

const subjectSelectElement = document.querySelector('#subjectId');

if (subjectSelectElement) {
    subjectSelectElement.onchange = () => getSubjectPagesCount(subjectSelectElement.value);
}

const modalElement = $('#staticBackdrop');
const uploadImgElement = document.querySelector('#upload-img');
const pageContentElement = document.querySelector('#page-content');
const progressElement = document.querySelector('#progress-bar');

let requireHideModal = false;

modalElement.on('shown.bs.modal', () => {
    if (requireHideModal) {
        modalElement.modal('hide');
    }
});

modalElement.on('hidden.bs.modal', () => {
    requireHideModal = false;
});

const editor = new SimpleMDE({
    element: pageContentElement,
    autosave: {
        enabled: true,
        uniqueId: 'PageContent', // check here if the script is loaded for new page or edit then set the proper id
        delay: 5000,
    },
    placeholder: 'Type here...',
    previewRender: plainText => mdConverter.makeHtml(plainText),
    promptURLs: false,
    toolbar: [
        'bold',
        'italic',
        'strikethrough',
        'heading',
        '|',
        'unordered-list',
        'ordered-list',
        'clean-block',
        '|',
        'link',
        {
            name: 'image',
            className: 'fa fa-picture-o',
            title: 'Insert Image',
            action: () => uploadImgElement.click()
        },
        'table',
        'horizontal-rule',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'undo',
        'redo'
    ]
});

uploadImgElement.onchange = () => {
    modalElement.modal('show');
    uploadFile(editor);
};

function uploadFile(editor) {
    const data = new FormData();
    data.append('img', uploadImgElement.files[0]);

    const request = new XMLHttpRequest();
    request.open('POST', '/upload');

    request.upload.addEventListener('progress', (e) => {
        const completionPercent = `${Math.floor(e.loaded / e.total * 100)}%`;
        progressElement.style.width = completionPercent;
        progressElement['aria-valuenow'] = completionPercent;
        progressElement.innerText = completionPercent;
    });

    request.addEventListener('load', (e) => {
        if (request.status === 200) {
            const response = JSON.parse(request.response);
            const _prompt = prompt;
            prompt = () => response.data.path;
            SimpleMDE.drawImage({...editor, options: {...editor.options, promptURLs: true}});
            prompt = _prompt;
        }
        requireHideModal = true;
        modalElement.modal('hide');
    });

    request.send(data);
}