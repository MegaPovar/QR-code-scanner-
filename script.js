let selectedFile = null;

    function handleFileSelect(event) {
      selectedFile = event.target.files[0];
      const fileStatus = document.getElementById("file-status");
      const scanButton = document.getElementById("scan-button");
      const saveButton = document.getElementById("save-button");

      if (selectedFile && !selectedFile.type.startsWith("image/")) {
        fileStatus.textContent = i18next.t("fileTypeNotSupported");
        scanButton.disabled = true;
        saveButton.disabled = true;
        document.getElementById("error-message").textContent = i18next.t("fileTypeNotSupported");
        return;
      }

      if (selectedFile) {
        fileStatus.textContent = i18next.t("fileSelected", { fileName: selectedFile.name });
        scanButton.disabled = false;
        saveButton.disabled = false;
        document.getElementById("error-message").textContent = "";
      } else {
        fileStatus.textContent = i18next.t("noFileSelected");
        scanButton.disabled = true;
        saveButton.disabled = true;
        document.getElementById("error-message").textContent = "";
      }

      clearResults();
    }

    function scanQRCode() {
      if (!selectedFile) {
        document.getElementById("error-message").textContent = i18next.t("errorMessage");
        return;
      }

      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decoded = jsQR(imageData.data, canvas.width, canvas.height);

          const resultElement = document.getElementById("qr-result");
          const resultTextElement = document.getElementById("qr-result-text");
          const errorMessageElement = document.getElementById("error-message");
          const saveButton = document.getElementById("save-button");

          resultElement.textContent = '';
          resultTextElement.textContent = '';

          if (decoded && decoded.data) {
            resultElement.textContent = decoded.data;
            resultTextElement.textContent = '';
            errorMessageElement.textContent = "";
            saveButton.disabled = false;
          } else {
            resultTextElement.textContent = i18next.t("resultText");
            resultElement.textContent = '';
            errorMessageElement.textContent = i18next.t("noQRCodeFound");
            saveButton.disabled = true;
          }
        };
      };

      reader.readAsDataURL(selectedFile);
    }

    function clearResults() {
      document.getElementById("qr-result").textContent = '';
      document.getElementById("qr-result-text").textContent = i18next.t('resultText');
      document.getElementById("error-message").textContent = '';
    }

    function changeLanguage(event) {
      const selectedLang = event.target.value;
      i18next.changeLanguage(selectedLang, () => {
        updateInterface();
      });
    }

    function updateInterface() {
      document.querySelector("label[for='qr-upload']").textContent = i18next.t('chooseFile');
      document.getElementById("file-status").textContent = i18next.t('noFileSelected');
      document.getElementById("scan-button-label").textContent = i18next.t('scanButton');
      document.getElementById("results-title").textContent = i18next.t('resultsTitle') + ":";
      document.getElementById("qr-result-text").textContent = i18next.t('resultText');
      document.getElementById("save-button").textContent = i18next.t('saveText');
      document.getElementById("error-message").textContent = "";
      clearResults();
    }

    i18next.init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            chooseFile: "Choose a file",
            noFileSelected: "No file selected",
            scanButton: "Scan QR Code",
            resultsTitle: "Results",
            result: "Result:",
            saveText: "Save Text",
            errorMessage: "Please select a file before scanning!",
            noQRCodeFound: "This image does not contain a QR Code.",
            resultText: "The result will be displayed here",
            fileSelected: "File selected: {{fileName}}",
            fileTypeNotSupported: "The selected file type is not supported. Please choose an image."
          }
        },
        ru: {
          translation: {
            chooseFile: "Выберите файл",
            noFileSelected: "Файл не выбран",
            scanButton: "Сканировать QR код",
            resultsTitle: "Результаты",
            result: "Результат:",
            saveText: "Сохранить текст",
            errorMessage: "Пожалуйста, выберите файл перед сканированием!",
            noQRCodeFound: "Это изображение не содержит QR код.",
            resultText: "Результат будет отображен здесь",
            fileSelected: "Выбран файл: {{fileName}}",
            fileTypeNotSupported: "Тип выбранного файла не поддерживается. Пожалуйста, выберите изображение."
          }
        }
      }
    });

    updateInterface();
    
    function saveTextToFile() {
      const text = document.getElementById("qr-result").textContent;
      if (!text || text === i18next.t("noQRCodeFound")) {
        alert(i18next.t('errorMessage'));
        return;
      }

      const blob = new Blob([text], { type: 'text/plain' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qr-result.txt";
      link.click();
    }