(function() {
  const form = document.querySelector('.download-request-form');
  const fileNameField = document.getElementById('download-file-name');
  const filePathField = document.getElementById('download-file');
  const params = new URLSearchParams(window.location.search);
  const fileParam = params.get('file');

  if (fileNameField) {
    if (fileParam) {
      const parts = fileParam.split('/');
      const prettyName = parts[parts.length - 1] || fileParam;
      fileNameField.value = prettyName;
    } else {
      fileNameField.placeholder = 'Select a file from the Projects page';
    }
  }

  if (filePathField) {
    filePathField.value = fileParam || '';
  }

  if (!form) return;
  form.addEventListener('submit', (e) => {
    const hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) {
      e.preventDefault();
    }
  });
})();
